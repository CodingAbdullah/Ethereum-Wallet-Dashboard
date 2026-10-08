import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "@/lib/db";

let db: Database;
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: () => db, isDatabaseConfigured: () => true }));
vi.mock("@/lib/gas", () => ({
    getGasEstimate: vi.fn(async () => ({ currentBlockNumber: 100, blockPrices: [{ blockNumber: 101, baseFeePerGas: 1.5, estimatedPrices: [{ confidence: 99, price: 2 }] }] }))
}));

import { createApiKey, DAILY_TOOL_CALLS } from "@/lib/apiKeys";
import { apiKeys, apiKeyUsage } from "@/lib/db/schema";
import { TOOLS } from "@/lib/tools";
import { POST } from "./route";
import { GET as list } from "../route";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

async function call(name: string, body?: string, key?: string) {
    const response = await POST(new Request(`https://ethereumdashboard.dev/api/v1/tools/${name}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(key ? { authorization: 'Bearer ' + key } : {}) },
        body
    }), { params: Promise.resolve({ name }) });
    return { status: response.status, json: await response.json(), headers: response.headers };
}

describe("/api/v1/tools", () => {
    const testDb = setupTestDb();
    let key: string;
    beforeEach(async () => {
        db = testDb();
        key = (await createApiKey(db, USER, 'test')).key;
    });

    it("lists every tool with its input schema", async () => {
        const { tools } = await list().json();
        expect(tools.map((t: { name: string }) => t.name)).toEqual(TOOLS.map(t => t.name));
        expect(tools[0]).toMatchObject({ endpoint: '/api/v1/tools/get_wallet_portfolio', input: { type: 'object', required: ['address'] } });
    });

    it("requires a valid API key", async () => {
        const none = await call('get_gas', '{}');
        expect(none.status).toBe(401);
        expect(none.headers.get('www-authenticate')).toBe('Bearer');
        expect((await call('get_gas', '{}', 'ethd_' + 'x'.repeat(32))).status).toBe(401);
    });

    it("runs a tool and reports the remaining quota", async () => {
        const gas = await call('get_gas', undefined, key);
        expect(gas.status).toBe(200);
        expect(gas.json).toEqual({ data: { currentBlock: 100, nextBaseFeeGwei: 1.5, estimates: [{ confidence: 99, price: 2 }] } });
        expect(gas.headers.get('x-ratelimit-remaining')).toBe(String(DAILY_TOOL_CALLS - 1));
    });

    it("rejects unknown tools and bad input without using the quota", async () => {
        expect((await call('send_eth', '{}', key)).status).toBe(404);
        expect((await call('get_gas', '{not json', key)).status).toBe(400);
        const bad = await call('get_wallet_portfolio', JSON.stringify({ address: 'x' }), key);
        expect(bad.status).toBe(400);
        expect(bad.json.error).toMatch(/^Invalid input: address/);
        expect(await db.select().from(apiKeyUsage)).toEqual([]);
    });

    it("stops at the daily quota (shared with the MCP server)", async () => {
        const [{ id: keyId }] = await db.select({ id: apiKeys.id }).from(apiKeys);
        await db.insert(apiKeyUsage).values({ keyId, day: new Date().toISOString().slice(0, 10), calls: DAILY_TOOL_CALLS });
        const over = await call('get_gas', '{}', key);
        expect(over.status).toBe(429);
        expect(over.json.error).toContain('resets at 00:00 UTC');
    });
});
