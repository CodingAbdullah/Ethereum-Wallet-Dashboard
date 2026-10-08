import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { setupTestDb } from "@/test/db";
import { testPushSubscription, testVapidEnv } from "@/test/push";
import type { Database } from "../db";
import { alertEvents, alertSubscriptions, notificationChannels, users } from "../db/schema";
import { runCheck } from "./engine";
import type { AlertData } from "./data";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const ENV = { TELEGRAM_BOT_TOKEN: 'bot-token' };
const NOW = new Date('2026-10-07T08:00:00Z');

let db: Database;
let sent: { url: string; body: Record<string, unknown> }[];
let fee: number;

const fetcher = (async (url: string, init: RequestInit) => {
    sent.push({ url, body: JSON.parse(String(init.body)) });
    return new Response('{}', { status: 200 });
}) as unknown as typeof fetch;

const data = { baseFeeGwei: async () => fee } as unknown as AlertData;

async function subscribe(params: Record<string, unknown>, channel: { verified?: boolean; target?: string | null } = {}) {
    const [c] = await db.insert(notificationChannels).values({ userAddress: USER, kind: 'telegram', target: channel.target === undefined ? '42' : channel.target, verified: channel.verified ?? true }).returning();
    const [s] = await db.insert(alertSubscriptions).values({ userAddress: USER, channelId: c.id, kind: 'gas_below', params }).returning();
    return s;
}

const testDb = setupTestDb();
beforeEach(async () => {
    db = testDb();
    await db.insert(users).values({ address: USER });
    sent = [];
    fee = 8;
});

describe("runCheck", () => {
    it("fires, records and delivers, then saves state so it doesn't fire again", async () => {
        const sub = await subscribe({ maxGwei: 10 });
        const first = await runCheck(db, 'gas_below', { data, env: ENV, fetcher, now: NOW });
        expect(first).toMatchObject({ subscriptions: 1, checked: 1, fired: 1, delivered: 1, failed: 0 });
        expect(sent[0].url).toBe('https://api.telegram.org/botbot-token/sendMessage');
        expect(sent[0].body.chat_id).toBe('42');

        const events = await db.select().from(alertEvents);
        expect(events).toMatchObject([{ subscriptionId: sub.id, kind: 'gas_below', delivered: true, deliveryError: null }]);
        const [saved] = await db.select().from(alertSubscriptions).where(eq(alertSubscriptions.id, sub.id));
        expect(saved.state).toEqual({ armed: false });
        expect(saved.lastTriggeredAt).toEqual(NOW);

        const second = await runCheck(db, 'gas_below', { data, env: ENV, fetcher, now: NOW });
        expect(second.fired).toBe(0);
        expect(sent).toHaveLength(1);
    });

    it("never sends the same dedupe key twice", async () => {
        await subscribe({ maxGwei: 10 });
        await runCheck(db, 'gas_below', { data, env: ENV, fetcher, now: NOW });
        await db.update(alertSubscriptions).set({ state: {} });          // pretend the state save was lost
        const again = await runCheck(db, 'gas_below', { data, env: ENV, fetcher, now: NOW });
        expect(again.fired).toBe(0);
        expect(sent).toHaveLength(1);
    });

    it("records delivery failures", async () => {
        await subscribe({ maxGwei: 10 });
        const summary = await runCheck(db, 'gas_below', { data, env: {}, fetcher, now: NOW });
        expect(summary).toMatchObject({ fired: 1, delivered: 0 });
        const [event] = await db.select().from(alertEvents);
        expect(event.delivered).toBe(false);
        expect(event.deliveryError).toContain('TELEGRAM_BOT_TOKEN');
    });

    it("stops sending to a browser that unsubscribed", async () => {
        const [c] = await db.insert(notificationChannels).values({ userAddress: USER, kind: 'webpush', target: JSON.stringify(testPushSubscription()), verified: true }).returning();
        await db.insert(alertSubscriptions).values({ userAddress: USER, channelId: c.id, kind: 'gas_below', params: { maxGwei: 10 } });
        const gone = (async () => new Response('', { status: 410 })) as unknown as typeof fetch;
        const summary = await runCheck(db, 'gas_below', { data, env: testVapidEnv(), fetcher: gone, now: NOW });
        expect(summary).toMatchObject({ fired: 1, delivered: 0 });
        const [channel] = await db.select().from(notificationChannels).where(eq(notificationChannels.id, c.id));
        expect(channel.verified).toBe(false);
        expect((await db.select().from(alertEvents))[0].deliveryError).toContain('no longer subscribed');
    });

    it("skips unverified channels, disabled subscriptions and bad params without stopping the run", async () => {
        await subscribe({ maxGwei: 10 }, { verified: false });
        await subscribe({ maxGwei: 10 }, { target: null });
        const disabled = await subscribe({ maxGwei: 10 });
        await db.update(alertSubscriptions).set({ enabled: false }).where(eq(alertSubscriptions.id, disabled.id));
        await subscribe({ maxGwei: 'cheap' });
        await subscribe({ maxGwei: 10 });
        const summary = await runCheck(db, 'gas_below', { data, env: ENV, fetcher, now: NOW });
        expect(summary).toMatchObject({ subscriptions: 2, checked: 1, failed: 1, fired: 1 });
    });

    it("leaves real-time kinds to Moralis Streams when it is configured", async () => {
        const summary = await runCheck(db, 'wallet_activity', { data, env: { MORALIS_STREAM_ID: 'id', MORALIS_STREAMS_SECRET: 's' }, fetcher });
        expect(summary.skipped).toBeTruthy();
    });

    it("rejects unknown kinds", async () => {
        await expect(runCheck(db, 'nope')).rejects.toThrow('Unknown alert kind');
    });
});
