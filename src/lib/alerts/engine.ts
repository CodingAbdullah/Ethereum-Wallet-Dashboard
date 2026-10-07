import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { Database } from "../db";
import { alertEvents, alertSubscriptions, notificationChannels, type AlertSubscription, type NotificationChannel } from "../db/schema";
import { alertKind, type Trigger } from "./kinds";
import { liveData, memoize, type AlertData } from "./data";
import { deliver, type ChannelKind } from "./deliver";

// Runs one alert type for every subscriber: check, save the checker's state, record what fired
// (the unique dedupe index stops anything being sent twice), then deliver it.

type Env = Record<string, string | undefined>;

export interface EngineOptions {
    data?: AlertData;
    now?: Date;
    env?: Env;
    fetcher?: typeof fetch;
}

export interface RunSummary { kind: string; subscriptions: number; checked: number; failed: number; fired: number; delivered: number; skipped?: string }

export type ActiveSubscription = AlertSubscription & { channel: NotificationChannel };

const CONCURRENCY = 4;
export const MAX_TRIGGERS_PER_RUN = 5;       // a burst (e.g. an airdrop spamming a wallet) shouldn't flood a chat

// Moralis Streams pushes wallet activity and approvals as they happen, so polling is only the fallback
export function streamsConfigured(env: Env = process.env): boolean {
    return !!(env.MORALIS_STREAM_ID && env.MORALIS_STREAMS_SECRET);
}

// Enabled subscriptions of the given kinds whose channel is verified and linked
export async function activeSubscriptions(db: Database, kinds: string[]): Promise<ActiveSubscription[]> {
    const rows = await db.select().from(alertSubscriptions)
        .innerJoin(notificationChannels, eq(alertSubscriptions.channelId, notificationChannels.id))
        .where(and(
            inArray(alertSubscriptions.kind, kinds),
            eq(alertSubscriptions.enabled, true),
            eq(notificationChannels.verified, true),
            isNotNull(notificationChannels.target)
        ));
    return rows.map(r => ({ ...r.alert_subscriptions, channel: r.notification_channels }));
}

// Records each trigger once and delivers the new ones. Returns how many were new and how many were delivered.
export async function fire(db: Database, sub: ActiveSubscription, triggers: Trigger[], options: EngineOptions = {}): Promise<{ fired: number; delivered: number }> {
    let fired = 0;
    let delivered = 0;
    for (const trigger of triggers.slice(0, MAX_TRIGGERS_PER_RUN)) {
        const [event] = await db.insert(alertEvents).values({
            subscriptionId: sub.id, userAddress: sub.userAddress, kind: sub.kind,
            dedupeKey: trigger.dedupeKey.slice(0, 300), title: trigger.title.slice(0, 300), message: trigger.message.slice(0, 3000), url: trigger.url ?? null
        }).onConflictDoNothing().returning({ id: alertEvents.id });
        if (!event) continue;                                        // already sent
        fired++;

        let deliveryError: string | null = null;
        try {
            await deliver({ channel: { kind: sub.channel.kind as ChannelKind, target: sub.channel.target! }, title: trigger.title, message: trigger.message, url: trigger.url, eventId: event.id }, options.env, options.fetcher);
            delivered++;
        }
        catch (err) {
            deliveryError = err instanceof Error ? err.message.slice(0, 500) : 'Delivery failed';
        }
        await db.update(alertEvents).set({ delivered: !deliveryError, deliveryError }).where(eq(alertEvents.id, event.id));
    }
    if (fired > 0) await db.update(alertSubscriptions).set({ lastTriggeredAt: options.now ?? new Date() }).where(eq(alertSubscriptions.id, sub.id));
    return { fired, delivered };
}

export async function runCheck(db: Database, kindId: string, options: EngineOptions = {}): Promise<RunSummary> {
    const kind = alertKind(kindId);
    if (!kind) throw new Error('Unknown alert kind: ' + kindId);
    const summary: RunSummary = { kind: kindId, subscriptions: 0, checked: 0, failed: 0, fired: 0, delivered: 0 };
    if (kind.realtime && streamsConfigured(options.env)) return { ...summary, skipped: 'Delivered in real time by Moralis Streams' };

    const queue = await activeSubscriptions(db, [kindId]);
    summary.subscriptions = queue.length;
    const data = memoize(options.data ?? liveData);
    const now = options.now ?? new Date();

    const worker = async () => {
        for (let sub = queue.shift(); sub; sub = queue.shift()) {
            try {
                const params = kind.params.parse(sub.params);
                const result = await kind.check(params, sub.state ?? {}, data, now);
                // Record first, then save state: if recording fails the next run retries the same triggers
                const { fired, delivered } = await fire(db, sub, result.triggers, { ...options, now });
                await db.update(alertSubscriptions).set({ state: result.state }).where(eq(alertSubscriptions.id, sub.id));
                summary.checked++;
                summary.fired += fired;
                summary.delivered += delivered;
            }
            catch (err) {
                summary.failed++;
                console.warn(`Alert check ${kindId} #${sub.id} failed:`, err instanceof Error ? err.message : err);
            }
        }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    return summary;
}
