import { beforeEach, describe, expect, it } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "./db";
import { apiKeys } from "./db/schema";
import { consumeQuota, createApiKey, DAILY_TOOL_CALLS, hashKey, listApiKeys, MAX_KEYS_PER_USER, revokeApiKey, verifyApiKey } from "./apiKeys";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

describe("API keys", () => {
    const testDb = setupTestDb();
    let db: Database;
    beforeEach(() => { db = testDb(); });

    it("creates a key, stores only its hash and verifies it", async () => {
        const { key, apiKey } = await createApiKey(db, USER, 'Claude');
        expect(key).toMatch(/^ethd_[\w-]{32}$/);
        expect(apiKey).toMatchObject({ name: 'Claude', prefix: key.slice(0, 9), usedToday: 0, dailyLimit: DAILY_TOOL_CALLS });
        const [row] = await db.select().from(apiKeys);
        expect(row.keyHash).toBe(hashKey(key));
        expect(JSON.stringify(row)).not.toContain(key);
        await expect(verifyApiKey(db, key)).resolves.toEqual({ keyId: row.id, userAddress: USER });
        await expect(verifyApiKey(db, key.slice(0, -1) + (key.endsWith('A') ? 'B' : 'A'))).resolves.toBeNull();
        await expect(verifyApiKey(db, 'not-a-key')).resolves.toBeNull();
        await expect(verifyApiKey(db, undefined)).resolves.toBeNull();
    });

    it("revokes keys (owner only) and caps keys per user", async () => {
        const { key, apiKey } = await createApiKey(db, USER, 'a');
        expect(await revokeApiKey(db, OTHER, apiKey.id)).toBe(false);
        expect(await revokeApiKey(db, USER, apiKey.id)).toBe(true);
        await expect(verifyApiKey(db, key)).resolves.toBeNull();
        expect(await listApiKeys(db, USER)).toEqual([]);
        for (let i = 0; i < MAX_KEYS_PER_USER; i++) await createApiKey(db, USER, 'k' + i);
        await expect(createApiKey(db, USER, 'one too many')).rejects.toMatchObject({ status: 409 });
    });

    it("counts tool calls per day and stops at the quota", async () => {
        const { apiKey } = await createApiKey(db, USER, 'a');
        const day1 = new Date('2026-10-07T10:00:00Z');
        for (let i = 0; i < DAILY_TOOL_CALLS; i++) expect((await consumeQuota(db, apiKey.id, day1)).allowed).toBe(true);
        expect(await consumeQuota(db, apiKey.id, day1)).toEqual({ allowed: false, used: DAILY_TOOL_CALLS + 1, limit: DAILY_TOOL_CALLS });
        expect((await listApiKeys(db, USER, day1))[0]).toMatchObject({ usedToday: DAILY_TOOL_CALLS + 1, lastUsedAt: day1 });
        expect((await consumeQuota(db, apiKey.id, new Date('2026-10-08T00:00:01Z'))).allowed).toBe(true);
        expect((await listApiKeys(db, USER, new Date('2026-10-08T12:00:00Z')))[0].usedToday).toBe(1);
    });
});
