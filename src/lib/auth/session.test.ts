import { describe, expect, it } from "vitest";
import { SESSION_MAX_AGE_SECONDS, createSessionToken, isAuthConfigured, readSessionToken } from "./session";

const SECRET = 'a'.repeat(32);
const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe("session tokens", () => {
    it("round-trips the address and chain", async () => {
        const token = await createSessionToken({ address: ADDRESS, chainId: 1 }, SECRET);
        expect(await readSessionToken(token, SECRET)).toEqual({ address: ADDRESS, chainId: 1 });
    });

    it("rejects a token signed with another secret", async () => {
        const token = await createSessionToken({ address: ADDRESS, chainId: 1 }, 'b'.repeat(32));
        expect(await readSessionToken(token, SECRET)).toBeNull();
    });

    it("rejects an expired token", async () => {
        const issued = Date.UTC(2026, 0, 1);
        const token = await createSessionToken({ address: ADDRESS, chainId: 1 }, SECRET, issued);
        expect(await readSessionToken(token, SECRET, issued + 1000)).not.toBeNull();
        expect(await readSessionToken(token, SECRET, issued + (SESSION_MAX_AGE_SECONDS + 1) * 1000)).toBeNull();
    });

    it("rejects tampered or missing tokens", async () => {
        const token = await createSessionToken({ address: ADDRESS, chainId: 1 }, SECRET);
        expect(await readSessionToken(token.slice(0, -2) + 'xx', SECRET)).toBeNull();
        expect(await readSessionToken(undefined, SECRET)).toBeNull();
    });

    it("requires a secret of at least 32 characters", async () => {
        expect(isAuthConfigured(undefined)).toBe(false);
        expect(isAuthConfigured('short')).toBe(false);
        expect(isAuthConfigured(SECRET)).toBe(true);
        await expect(createSessionToken({ address: ADDRESS, chainId: 1 }, 'short')).rejects.toThrow('AUTH_SECRET');
    });
});
