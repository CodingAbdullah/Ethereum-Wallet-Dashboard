import { beforeEach, describe, expect, it } from "vitest";
import { setupTestDb } from "@/test/db";
import { testPushSubscription, testVapidEnv } from "@/test/push";
import type { Database } from "../db";
import { alertEvents, notificationChannels } from "../db/schema";
import {
    createChannel, createSubscription, deleteChannel, deleteSubscription, listChannels, listEvents, listSubscriptions,
    MAX_SUBSCRIPTIONS, sendTestAlert, setSubscriptionEnabled, verifyEmailChannel
} from "./accounts";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER_USER = '0x000000000000000000000000000000000000dEaD';
const WATCHED = '0x1111111111111111111111111111111111111111';
const ORIGIN = 'https://ethereumdashboard.dev';
const DISCORD = 'https://discord.com/api/webhooks/123/abc-DEF_secret';
const ENV = { TELEGRAM_BOT_TOKEN: 't', TELEGRAM_BOT_USERNAME: 'EthDashBot', RESEND_API_KEY: 'r', ALERTS_FROM_EMAIL: 'alerts@ethereumdashboard.dev', MORALIS_STREAM_ID: 'stream', MORALIS_API_KEY: 'k' };

let db: Database;
let calls: { url: string; method?: string; body: Record<string, unknown> }[];
let status: number;
const fetcher = (async (url: string, init: RequestInit) => {
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(String(init.body)); } catch { /* encrypted push payload */ }
    calls.push({ url, method: init.method, body });
    return new Response('{}', { status });
}) as unknown as typeof fetch;
const deps = () => ({ env: ENV, fetcher });

const testDb = setupTestDb();
beforeEach(async () => {
    db = testDb();
    calls = [];
    status = 200;
});

describe("channels", () => {
    it("creates a pending Telegram channel with a one-time link", async () => {
        const { channel, link } = await createChannel(db, USER, { kind: 'telegram' }, ORIGIN, deps());
        expect(channel).toMatchObject({ kind: 'telegram', verified: false });
        expect(link).toMatch(/^https:\/\/t\.me\/EthDashBot\?start=[\w-]{20,}$/);
        expect(JSON.stringify(await listChannels(db, USER))).not.toContain(link!.split('=')[1]);
    });

    it("checks a Discord webhook with a test message and never returns the URL", async () => {
        const { channel } = await createChannel(db, USER, { kind: 'discord', target: DISCORD, label: 'Team' }, ORIGIN, deps());
        expect(channel).toMatchObject({ verified: true, label: 'Team', display: 'Discord webhook …secret' });
        expect(calls[0].url).toBe(DISCORD);
        await expect(createChannel(db, USER, { kind: 'discord', target: DISCORD }, ORIGIN, deps())).rejects.toMatchObject({ status: 409 });
        await expect(createChannel(db, USER, { kind: 'discord', target: 'https://evil.example/hook' }, ORIGIN, deps())).rejects.toMatchObject({ status: 400 });
        status = 404;
        await expect(createChannel(db, USER, { kind: 'discord', target: DISCORD.replace('123', '456') }, ORIGIN, deps())).rejects.toMatchObject({ status: 400 });
    });

    it("verifies email through the emailed link", async () => {
        const { channel } = await createChannel(db, USER, { kind: 'email', target: 'me@example.com' }, ORIGIN, deps());
        expect(channel.verified).toBe(false);
        const link = String(calls[0].body.text).match(/https:\/\/\S+/)![0];
        expect(link).toMatch(/^https:\/\/ethereumdashboard\.dev\/alerts\/verify\?token=/);
        const token = new URL(link).searchParams.get('token')!;
        expect(await verifyEmailChannel(db, 'wrong-token-123')).toBe(false);
        expect(await verifyEmailChannel(db, token)).toBe(true);
        expect(await verifyEmailChannel(db, token)).toBe(false);
        expect((await listChannels(db, USER))[0].verified).toBe(true);
    });

    it("rolls back an email channel whose verification email fails", async () => {
        status = 500;
        await expect(createChannel(db, USER, { kind: 'email', target: 'me@example.com' }, ORIGIN, deps())).rejects.toMatchObject({ status: 502 });
        expect(await listChannels(db, USER)).toEqual([]);
    });

    it("needs the server to be configured", async () => {
        await expect(createChannel(db, USER, { kind: 'telegram' }, ORIGIN, { env: {}, fetcher })).rejects.toMatchObject({ status: 503 });
        await expect(createChannel(db, USER, { kind: 'email', target: 'me@example.com' }, ORIGIN, { env: {}, fetcher })).rejects.toMatchObject({ status: 503 });
    });

    it("only lets the owner test or delete a channel", async () => {
        const { channel } = await createChannel(db, USER, { kind: 'discord', target: DISCORD }, ORIGIN, deps());
        await expect(sendTestAlert(db, OTHER_USER, channel.id, deps())).rejects.toMatchObject({ status: 404 });
        expect(await deleteChannel(db, OTHER_USER, channel.id, deps())).toBe(false);
        await sendTestAlert(db, USER, channel.id, deps());
        expect(calls).toHaveLength(2);
        expect(await deleteChannel(db, USER, channel.id, deps())).toBe(true);
    });

    it("won't send a test to a channel that isn't set up", async () => {
        const { channel } = await createChannel(db, USER, { kind: 'telegram' }, ORIGIN, deps());
        await expect(sendTestAlert(db, USER, channel.id, deps())).rejects.toMatchObject({ status: 409 });
    });

    it("adds a browser after a test notification gets through, and hides the endpoint", async () => {
        const env = { ...ENV, ...testVapidEnv() };
        const sub = testPushSubscription('https://fcm.googleapis.com/fcm/send/secret-endpoint');
        const { channel } = await createChannel(db, USER, { kind: 'webpush', target: JSON.stringify({ ...sub, expirationTime: null }) }, ORIGIN, { env, fetcher });
        expect(channel).toMatchObject({ kind: 'webpush', verified: true, display: 'Notifications in this browser (Chrome, Edge or Brave)' });
        expect(calls[0].url).toBe(sub.endpoint);
        expect(JSON.stringify(await listChannels(db, USER))).not.toContain('secret-endpoint');
        // Same subscription again (in any key order) is a duplicate
        await expect(createChannel(db, USER, { kind: 'webpush', target: JSON.stringify({ keys: sub.keys, endpoint: sub.endpoint }) }, ORIGIN, { env, fetcher })).rejects.toMatchObject({ status: 409 });
        await expect(createChannel(db, USER, { kind: 'webpush', target: JSON.stringify({ ...sub, endpoint: 'https://evil.example/x' }) }, ORIGIN, { env, fetcher })).rejects.toMatchObject({ status: 400 });
        await expect(createChannel(db, USER, { kind: 'webpush', target: JSON.stringify(testPushSubscription()) }, ORIGIN, deps())).rejects.toMatchObject({ status: 503 });
        status = 410;
        await expect(createChannel(db, USER, { kind: 'webpush', target: JSON.stringify(testPushSubscription('https://fcm.googleapis.com/fcm/send/other')) }, ORIGIN, { env, fetcher })).rejects.toMatchObject({ status: 400 });

        // A test alert to a browser that unsubscribed deactivates the channel
        await expect(sendTestAlert(db, USER, channel.id, { env, fetcher })).rejects.toMatchObject({ status: 502 });
        expect((await listChannels(db, USER))[0]).toMatchObject({ verified: false, display: expect.stringContaining('Remove it and add it again') });
    });
});

describe("subscriptions", () => {
    async function discord() {
        return (await createChannel(db, USER, { kind: 'discord', target: DISCORD }, ORIGIN, deps())).channel.id;
    }

    it("validates params per type and describes the alert", async () => {
        const channelId = await discord();
        const sub = await createSubscription(db, USER, { kind: 'gas_below', channelId, params: { maxGwei: 5 } }, deps());
        expect(sub).toMatchObject({ kind: 'gas_below', title: 'Gas below a price', summary: 'Base fee at or under 5 gwei', enabled: true });
        await expect(createSubscription(db, USER, { kind: 'gas_below', channelId, params: { maxGwei: -1 } }, deps())).rejects.toThrow();
        await expect(createSubscription(db, USER, { kind: 'nope', channelId, params: {} }, deps())).rejects.toMatchObject({ status: 400 });
        await expect(createSubscription(db, OTHER_USER, { kind: 'gas_below', channelId, params: { maxGwei: 5 } }, deps())).rejects.toMatchObject({ status: 404 });
    });

    it("watches wallets on Moralis Streams and lets go once no alert needs them", async () => {
        const channelId = await discord();
        calls = [];
        const a = await createSubscription(db, USER, { kind: 'wallet_activity', channelId, params: { address: WATCHED, chain: 'eth' } }, deps());
        const b = await createSubscription(db, USER, { kind: 'risky_approval', channelId, params: { address: WATCHED, chain: 'eth' } }, deps());
        expect(calls.map(c => c.method)).toEqual(['POST', 'POST']);
        expect(calls[0].url).toBe('https://api.moralis-streams.com/streams/evm/stream/address');

        await deleteSubscription(db, USER, a.id, deps());
        expect(calls).toHaveLength(2);                       // still needed by the approvals alert
        await deleteSubscription(db, USER, b.id, deps());
        expect(calls[2]).toMatchObject({ method: 'DELETE', body: { address: [WATCHED.toLowerCase()] } });
    });

    it("refuses the alert if the wallet can't be watched", async () => {
        const channelId = await discord();
        status = 500;
        await expect(createSubscription(db, USER, { kind: 'wallet_activity', channelId, params: { address: WATCHED, chain: 'eth' } }, deps())).rejects.toMatchObject({ status: 502 });
        expect(await listSubscriptions(db, USER)).toEqual([]);
    });

    it("pauses, caps and deletes with the channel", async () => {
        const channelId = await discord();
        const sub = await createSubscription(db, USER, { kind: 'depeg', channelId, params: { asset: 'usdc' } }, deps());
        expect((await setSubscriptionEnabled(db, USER, sub.id, false)).enabled).toBe(false);
        await expect(setSubscriptionEnabled(db, OTHER_USER, sub.id, true)).rejects.toMatchObject({ status: 404 });
        for (let i = 1; i < MAX_SUBSCRIPTIONS; i++) await createSubscription(db, USER, { kind: 'gas_below', channelId, params: { maxGwei: i } }, deps());
        await expect(createSubscription(db, USER, { kind: 'gas_below', channelId, params: { maxGwei: 1 } }, deps())).rejects.toMatchObject({ status: 409 });
        await deleteChannel(db, USER, channelId, deps());
        expect(await listSubscriptions(db, USER)).toEqual([]);
    });

    it("lists the user's own alert history, newest first", async () => {
        const channelId = await discord();
        const sub = await createSubscription(db, USER, { kind: 'gas_below', channelId, params: { maxGwei: 5 } }, deps());
        await db.insert(alertEvents).values([
            { subscriptionId: sub.id, userAddress: USER, kind: 'gas_below', dedupeKey: 'a', title: 'First', message: 'm' },
            { subscriptionId: sub.id, userAddress: USER, kind: 'gas_below', dedupeKey: 'b', title: 'Second', message: 'm' }
        ]);
        expect((await listEvents(db, USER)).map(e => e.title)).toEqual(['Second', 'First']);
        expect(await listEvents(db, OTHER_USER)).toEqual([]);
        expect((await db.select().from(notificationChannels)).length).toBe(1);
    });
});
