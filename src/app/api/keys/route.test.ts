import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
    cookies: async () => ({ get: (name: string) => cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined })
}));

const SECRET = 'a'.repeat(32);

// Key logic is covered in src/lib/apiKeys.test.ts; these check the session and input guards
describe("/api/keys", () => {
    beforeEach(() => { cookieJar.clear(); vi.stubEnv('AUTH_SECRET', SECRET); });

    it("requires a session", async () => {
        const { GET, POST } = await import("./route");
        expect((await GET()).status).toBe(401);
        expect((await POST(postRequest({ name: 'x' }))).status).toBe(401);
    });

    it("validates the name", async () => {
        cookieJar.set(SESSION_COOKIE, await createSessionToken({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', chainId: 1 }, SECRET));
        const { POST } = await import("./route");
        expect((await POST(postRequest({ name: '' }))).status).toBe(400);
        expect((await POST(postRequest({ name: 'x'.repeat(41) }))).status).toBe(400);
    });
});
