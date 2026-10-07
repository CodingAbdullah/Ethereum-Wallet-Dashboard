import { randomBytes } from "node:crypto";
import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { HttpError } from "../api/errors";
import type { Database } from "../db";
import { alertEvents, alertSubscriptions, notificationChannels, users, type NotificationChannel } from "../db/schema";
import { alertKind } from "./kinds";
import { deliver, deliverDirect, isDiscordWebhook, isEmail, type ChannelKind } from "./deliver";
import { REALTIME_KINDS, unwatchAddresses, watchAddresses } from "./streams";
import { LINK_TOKEN_TTL_MS, telegramLink } from "./telegram";

// Notification channels and alert subscriptions for signed-in users (the /api/alerts routes).
// The caps keep the checks inside the free plans of the data providers they call.

export const MAX_CHANNELS = 5;
export const MAX_SUBSCRIPTIONS = 20;
export const MAX_EVENTS = 50;

type Env = Record<string, string | undefined>;
export interface AlertDeps { env?: Env; fetcher?: typeof fetch; now?: Date }

export interface PublicChannel { id: number; kind: ChannelKind; label: string | null; verified: boolean; display: string; createdAt: Date }
export interface PublicSubscription { id: number; kind: string; title: string; summary: string; channelId: number; enabled: boolean; params: Record<string, unknown>; lastTriggeredAt: Date | null; createdAt: Date }

const newToken = () => randomBytes(18).toString('base64url');

// Never send a Discord webhook URL (it's a secret) or a link token back to the browser
function display(c: NotificationChannel): string {
    if (!c.target) return c.kind === 'telegram' ? 'Waiting for you to press Start in Telegram' : '';
    if (c.kind === 'discord') return 'Discord webhook …' + c.target.slice(-6);
    if (c.kind === 'telegram') return 'Telegram chat';
    return c.target;
}

const toPublic = (c: NotificationChannel): PublicChannel => ({ id: c.id, kind: c.kind as ChannelKind, label: c.label, verified: c.verified, display: display(c), createdAt: c.createdAt });

export async function listChannels(db: Database, user: string): Promise<PublicChannel[]> {
    const rows = await db.select().from(notificationChannels).where(eq(notificationChannels.userAddress, user)).orderBy(notificationChannels.createdAt);
    return rows.map(toPublic);
}

export interface NewChannel { kind: ChannelKind; target?: string; label?: string }

// Telegram: pending until the user presses Start (returns the link). Discord: a test message must go through.
// Email: pending until the link in the verification email is opened.
export async function createChannel(db: Database, user: string, input: NewChannel, origin: string, deps: AlertDeps = {}): Promise<{ channel: PublicChannel; link?: string }> {
    const env = deps.env ?? process.env;
    const [{ total }] = await db.select({ total: count() }).from(notificationChannels).where(eq(notificationChannels.userAddress, user));
    if (total >= MAX_CHANNELS) throw new HttpError(409, `You can add up to ${MAX_CHANNELS} channels`);
    await db.insert(users).values({ address: user }).onConflictDoNothing();
    const label = input.label?.trim() || null;
    const target = input.target?.trim() ?? '';

    if (target && (await db.select({ id: notificationChannels.id }).from(notificationChannels)
        .where(and(eq(notificationChannels.userAddress, user), eq(notificationChannels.kind, input.kind), eq(notificationChannels.target, target)))).length > 0) {
        throw new HttpError(409, 'You already added this channel');
    }

    if (input.kind === 'telegram') {
        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_BOT_USERNAME) throw new HttpError(503, 'Telegram alerts are not configured on this server');
        const token = newToken();
        const [row] = await db.insert(notificationChannels).values({ userAddress: user, kind: 'telegram', label, verifyToken: token }).returning();
        return { channel: toPublic(row), link: telegramLink(env.TELEGRAM_BOT_USERNAME, token) };
    }

    if (input.kind === 'discord') {
        if (!isDiscordWebhook(target)) throw new HttpError(400, 'Enter a Discord webhook URL (https://discord.com/api/webhooks/…)');
        try {
            await deliverDirect({ channel: { kind: 'discord', target }, title: 'Ethereum Dashboard alerts', message: 'This channel is connected. Your alerts will appear here.' }, env, deps.fetcher);
        }
        catch {
            throw new HttpError(400, "Discord didn't accept a message on that webhook. Check the URL and try again.");
        }
        const [row] = await db.insert(notificationChannels).values({ userAddress: user, kind: 'discord', target, label, verified: true }).returning();
        return { channel: toPublic(row) };
    }

    if (!isEmail(target)) throw new HttpError(400, 'Enter a valid email address');
    if (!env.RESEND_API_KEY || !env.ALERTS_FROM_EMAIL) throw new HttpError(503, 'Email alerts are not configured on this server');
    const token = newToken();
    const [row] = await db.insert(notificationChannels).values({ userAddress: user, kind: 'email', target, label, verifyToken: token }).returning();
    try {
        await deliverDirect({
            channel: { kind: 'email', target },
            title: 'Confirm your email for Ethereum Dashboard alerts',
            message: 'Open this link to start getting alerts at this address. It expires in 24 hours. If you didn\'t ask for this, ignore this email.',
            url: `${origin}/alerts/verify?token=${token}`
        }, env, deps.fetcher);
    }
    catch {
        await db.delete(notificationChannels).where(eq(notificationChannels.id, row.id));
        throw new HttpError(502, "Couldn't send the verification email. Try again later.");
    }
    return { channel: toPublic(row) };
}

export async function verifyEmailChannel(db: Database, token: string, now = new Date()): Promise<boolean> {
    if (!/^[\w-]{10,64}$/.test(token)) return false;
    const verified = await db.update(notificationChannels)
        .set({ verified: true, verifyToken: null })
        .where(and(eq(notificationChannels.kind, 'email'), eq(notificationChannels.verifyToken, token), gt(notificationChannels.createdAt, new Date(now.getTime() - LINK_TOKEN_TTL_MS))))
        .returning({ id: notificationChannels.id });
    return verified.length > 0;
}

// Stop watching addresses on Moralis Streams once no alert needs them (best effort: an extra watched
// address only costs a few unused webhook deliveries)
async function releaseAddresses(db: Database, addresses: string[], deps: AlertDeps) {
    const unused: string[] = [];
    for (const address of new Set(addresses.map(a => a.toLowerCase()))) {
        const [{ total }] = await db.select({ total: count() }).from(alertSubscriptions)
            .where(and(sql`${alertSubscriptions.kind} in ('wallet_activity', 'risky_approval')`, sql`lower(${alertSubscriptions.params}->>'address') = ${address}`));
        if (total === 0) unused.push(address);
    }
    await unwatchAddresses(unused, deps.env, deps.fetcher).catch(() => {});
}

const realtimeAddresses = (subs: { kind: string; params: Record<string, unknown> }[]) =>
    subs.filter(s => REALTIME_KINDS.includes(s.kind) && typeof s.params.address === 'string').map(s => s.params.address as string);

export async function deleteChannel(db: Database, user: string, id: number, deps: AlertDeps = {}): Promise<boolean> {
    const subs = await db.select({ kind: alertSubscriptions.kind, params: alertSubscriptions.params }).from(alertSubscriptions)
        .where(and(eq(alertSubscriptions.channelId, id), eq(alertSubscriptions.userAddress, user)));
    const removed = await db.delete(notificationChannels)
        .where(and(eq(notificationChannels.id, id), eq(notificationChannels.userAddress, user)))
        .returning({ id: notificationChannels.id });
    if (removed.length === 0) return false;
    await releaseAddresses(db, realtimeAddresses(subs), deps);
    return true;
}

async function ownedChannel(db: Database, user: string, id: number): Promise<NotificationChannel> {
    const [channel] = await db.select().from(notificationChannels).where(and(eq(notificationChannels.id, id), eq(notificationChannels.userAddress, user)));
    if (!channel) throw new HttpError(404, 'Channel not found');
    return channel;
}

export async function sendTestAlert(db: Database, user: string, channelId: number, deps: AlertDeps = {}): Promise<void> {
    const channel = await ownedChannel(db, user, channelId);
    if (!channel.verified || !channel.target) throw new HttpError(409, 'Finish setting up this channel first');
    try {
        await deliver({ channel: { kind: channel.kind as ChannelKind, target: channel.target }, title: 'Test alert', message: 'Alerts from Ethereum Dashboard will look like this.', url: 'https://ethereumdashboard.dev/alerts' }, deps.env, deps.fetcher);
    }
    catch (err) {
        throw new HttpError(502, 'The test alert could not be delivered: ' + (err instanceof Error ? err.message : 'unknown error'));
    }
}

function toPublicSubscription(s: typeof alertSubscriptions.$inferSelect): PublicSubscription {
    const kind = alertKind(s.kind);
    let summary = kind?.title ?? s.kind;
    try { if (kind) summary = kind.describe(kind.params.parse(s.params)); } catch { /* keep the title */ }
    return { id: s.id, kind: s.kind, title: kind?.title ?? s.kind, summary, channelId: s.channelId, enabled: s.enabled, params: s.params, lastTriggeredAt: s.lastTriggeredAt, createdAt: s.createdAt };
}

export async function listSubscriptions(db: Database, user: string): Promise<PublicSubscription[]> {
    const rows = await db.select().from(alertSubscriptions).where(eq(alertSubscriptions.userAddress, user)).orderBy(alertSubscriptions.createdAt);
    return rows.map(toPublicSubscription);
}

export async function createSubscription(db: Database, user: string, input: { kind: string; channelId: number; params: unknown }, deps: AlertDeps = {}): Promise<PublicSubscription> {
    const kind = alertKind(input.kind);
    if (!kind) throw new HttpError(400, 'Unknown alert type');
    const params = kind.params.parse(input.params ?? {}) as Record<string, unknown>;     // ZodError → 400
    await ownedChannel(db, user, input.channelId);
    const [{ total }] = await db.select({ total: count() }).from(alertSubscriptions).where(eq(alertSubscriptions.userAddress, user));
    if (total >= MAX_SUBSCRIPTIONS) throw new HttpError(409, `You can have up to ${MAX_SUBSCRIPTIONS} alerts`);

    if (kind.realtime && typeof params.address === 'string') {
        try { await watchAddresses([params.address], deps.env, deps.fetcher); }
        catch { throw new HttpError(502, 'Could not start watching this wallet. Try again in a minute.'); }
    }
    const [row] = await db.insert(alertSubscriptions).values({ userAddress: user, channelId: input.channelId, kind: kind.id, params }).returning();
    return toPublicSubscription(row);
}

export async function setSubscriptionEnabled(db: Database, user: string, id: number, enabled: boolean): Promise<PublicSubscription> {
    const [row] = await db.update(alertSubscriptions).set({ enabled })
        .where(and(eq(alertSubscriptions.id, id), eq(alertSubscriptions.userAddress, user))).returning();
    if (!row) throw new HttpError(404, 'Alert not found');
    return toPublicSubscription(row);
}

export async function deleteSubscription(db: Database, user: string, id: number, deps: AlertDeps = {}): Promise<boolean> {
    const removed = await db.delete(alertSubscriptions)
        .where(and(eq(alertSubscriptions.id, id), eq(alertSubscriptions.userAddress, user)))
        .returning({ kind: alertSubscriptions.kind, params: alertSubscriptions.params });
    if (removed.length === 0) return false;
    await releaseAddresses(db, realtimeAddresses(removed), deps);
    return true;
}

export async function listEvents(db: Database, user: string) {
    return db.select({
        id: alertEvents.id, subscriptionId: alertEvents.subscriptionId, kind: alertEvents.kind, title: alertEvents.title, message: alertEvents.message,
        url: alertEvents.url, delivered: alertEvents.delivered, deliveryError: alertEvents.deliveryError, createdAt: alertEvents.createdAt
    }).from(alertEvents).where(eq(alertEvents.userAddress, user)).orderBy(desc(alertEvents.createdAt), desc(alertEvents.id)).limit(MAX_EVENTS);
}
