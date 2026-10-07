import { createHash, randomBytes } from "node:crypto";
import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { HttpError } from "./api/errors";
import type { Database } from "./db";
import { apiKeyUsage, apiKeys, users } from "./db/schema";

// API keys for the MCP server. A key is "ethd_" plus 32 random characters; only its SHA-256 hash is
// stored (the key is random, so a plain hash is enough). Each key gets a daily tool-call quota so
// MCP clients can't use up the free-plan quotas of the data providers.

export const MAX_KEYS_PER_USER = 3;
export const DAILY_TOOL_CALLS = 200;
const KEY_PATTERN = /^ethd_[A-Za-z0-9_-]{32}$/;

export const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');
const today = (now: Date) => now.toISOString().slice(0, 10);

export interface PublicApiKey { id: number; name: string; prefix: string; createdAt: Date; lastUsedAt: Date | null; usedToday: number; dailyLimit: number }

export async function createApiKey(db: Database, user: string, name: string): Promise<{ key: string; apiKey: PublicApiKey }> {
    const [{ total }] = await db.select({ total: count() }).from(apiKeys).where(and(eq(apiKeys.userAddress, user), isNull(apiKeys.revokedAt)));
    if (total >= MAX_KEYS_PER_USER) throw new HttpError(409, `You can have up to ${MAX_KEYS_PER_USER} API keys. Revoke one first.`);
    await db.insert(users).values({ address: user }).onConflictDoNothing();
    const key = 'ethd_' + randomBytes(24).toString('base64url');
    const [row] = await db.insert(apiKeys).values({ userAddress: user, name: name.trim() || 'API key', prefix: key.slice(0, 9), keyHash: hashKey(key) }).returning();
    return { key, apiKey: { id: row.id, name: row.name, prefix: row.prefix, createdAt: row.createdAt, lastUsedAt: null, usedToday: 0, dailyLimit: DAILY_TOOL_CALLS } };
}

export async function listApiKeys(db: Database, user: string, now = new Date()): Promise<PublicApiKey[]> {
    const rows = await db.select({
        id: apiKeys.id, name: apiKeys.name, prefix: apiKeys.prefix, createdAt: apiKeys.createdAt, lastUsedAt: apiKeys.lastUsedAt,
        usedToday: sql<number>`coalesce(${apiKeyUsage.calls}, 0)`.mapWith(Number)
    }).from(apiKeys)
        .leftJoin(apiKeyUsage, and(eq(apiKeyUsage.keyId, apiKeys.id), eq(apiKeyUsage.day, today(now))))
        .where(and(eq(apiKeys.userAddress, user), isNull(apiKeys.revokedAt)))
        .orderBy(asc(apiKeys.createdAt));
    return rows.map(r => ({ ...r, dailyLimit: DAILY_TOOL_CALLS }));
}

export async function revokeApiKey(db: Database, user: string, id: number, now = new Date()): Promise<boolean> {
    const revoked = await db.update(apiKeys).set({ revokedAt: now })
        .where(and(eq(apiKeys.id, id), eq(apiKeys.userAddress, user), isNull(apiKeys.revokedAt)))
        .returning({ id: apiKeys.id });
    return revoked.length > 0;
}

export async function verifyApiKey(db: Database, key: string | undefined | null): Promise<{ keyId: number; userAddress: string } | null> {
    if (!key || !KEY_PATTERN.test(key)) return null;
    const [row] = await db.select({ keyId: apiKeys.id, userAddress: apiKeys.userAddress }).from(apiKeys)
        .where(and(eq(apiKeys.keyHash, hashKey(key)), isNull(apiKeys.revokedAt)));
    return row ?? null;
}

// Counts one tool call against today's quota (atomically) and returns whether it is allowed
export async function consumeQuota(db: Database, keyId: number, now = new Date()): Promise<{ allowed: boolean; used: number; limit: number }> {
    const [row] = await db.insert(apiKeyUsage).values({ keyId, day: today(now), calls: 1 })
        .onConflictDoUpdate({ target: [apiKeyUsage.keyId, apiKeyUsage.day], set: { calls: sql`${apiKeyUsage.calls} + 1` } })
        .returning({ calls: apiKeyUsage.calls });
    await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, keyId));
    return { allowed: row.calls <= DAILY_TOOL_CALLS, used: row.calls, limit: DAILY_TOOL_CALLS };
}
