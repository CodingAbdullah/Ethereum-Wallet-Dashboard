import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
    cookies: async () => ({ get: (name: string) => cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined })
}));

const SECRET = 'a'.repeat(32);
const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe("/api/wallets", () => {
    beforeEach(() => cookieJar.clear());

    it("returns 503 when sign-in is not configured", async () => {
        vi.stubEnv('AUTH_SECRET', '');
        const { GET } = await import("./route");
        expect((await GET()).status).toBe(503);
    });

    it("returns 401 without a session", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        const { GET } = await import("./route");
        expect((await GET()).status).toBe(401);
    });

    it("returns 503 for a signed-in user when the database is not configured", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        vi.stubEnv('DATABASE_URL', '');
        cookieJar.set(SESSION_COOKIE, await createSessionToken({ address: ADDRESS, chainId: 1 }, SECRET));
        const { GET } = await import("./route");
        const response = await GET();
        expect(response.status).toBe(503);
        expect((await response.json()).error).toContain('DATABASE_URL');
    });

    it("validates the wallet before touching the database", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        cookieJar.set(SESSION_COOKIE, await createSessionToken({ address: ADDRESS, chainId: 1 }, SECRET));
        const { POST } = await import("./route");
        expect((await POST(postRequest({ address: 'not-an-address' }))).status).toBe(400);
    });
});
