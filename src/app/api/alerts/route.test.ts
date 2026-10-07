import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
    cookies: async () => ({ get: (name: string) => cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined })
}));

const SECRET = 'a'.repeat(32);

// The database logic is covered in src/lib/alerts/accounts.test.ts; these check the session and input guards
describe("/api/alerts/*", () => {
    beforeEach(() => cookieJar.clear());

    it("require a session", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        const channels = await import("./channels/route");
        const subscriptions = await import("./subscriptions/route");
        const events = await import("./events/route");
        const test = await import("./test/route");
        expect((await channels.GET()).status).toBe(401);
        expect((await subscriptions.GET()).status).toBe(401);
        expect((await events.GET()).status).toBe(401);
        expect((await test.POST(postRequest({ channelId: 1 }))).status).toBe(401);
    });

    it("validate input before touching the database", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        cookieJar.set(SESSION_COOKIE, await createSessionToken({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', chainId: 1 }, SECRET));
        const channels = await import("./channels/route");
        const subscriptions = await import("./subscriptions/route");
        expect((await channels.POST(postRequest({ kind: 'sms', target: '123' }))).status).toBe(400);
        expect((await subscriptions.POST(postRequest({ kind: 'gas_below', channelId: 'x' }))).status).toBe(400);
        expect((await subscriptions.PATCH(postRequest({ id: 1 }))).status).toBe(400);
    });
});
