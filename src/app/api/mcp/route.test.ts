import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "@/lib/db";

let db: Database;
vi.mock("@/lib/db", () => ({ getDb: () => db, isDatabaseConfigured: () => true }));
vi.mock("@/lib/gas", () => ({
    getGasEstimate: vi.fn(async () => ({ currentBlockNumber: 100, blockPrices: [{ blockNumber: 101, baseFeePerGas: 1.5, estimatedPrices: [{ confidence: 99, price: 2 }] }] }))
}));

import { createApiKey, DAILY_TOOL_CALLS } from "@/lib/apiKeys";
import { apiKeys, apiKeyUsage } from "@/lib/db/schema";
import { TOOLS } from "@/lib/tools";
import { POST } from "./route";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
let id = 0;

// One JSON-RPC call over Streamable HTTP; the reply may come back as JSON or as one SSE event
async function rpc(method: string, params: unknown, auth: { header?: string; query?: string } = {}) {
    const url = 'https://ethereumdashboard.dev/api/mcp' + (auth.query ? '?key=' + auth.query : '');
    const response = await POST(new Request(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2025-06-18', ...(auth.header ? { authorization: 'Bearer ' + auth.header } : {}) },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params })
    }));
    const raw = await response.text();
    const body = response.headers.get('content-type')?.includes('text/event-stream') ? raw.split('\n').find(l => l.startsWith('data:'))?.slice(5) : raw;
    return { status: response.status, json: body ? JSON.parse(body) : null, headers: response.headers };
}

const init = { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } };

describe("/api/mcp", () => {
    const testDb = setupTestDb();
    let key: string;
    beforeEach(async () => {
        db = testDb();
        key = (await createApiKey(db, USER, 'test')).key;
    });

    it("requires a valid API key", async () => {
        const none = await rpc('initialize', init);
        expect(none.status).toBe(401);
        expect(none.headers.get('www-authenticate')).toMatch(/^Bearer/);
        expect((await rpc('initialize', init, { header: 'ethd_' + 'x'.repeat(32) })).status).toBe(401);
    });

    it("lists every registry tool as read-only", async () => {
        expect((await rpc('initialize', init, { header: key })).json.result.serverInfo.name).toBe('ethereum-dashboard');
        const { json } = await rpc('tools/list', {}, { header: key });
        const tools = json.result.tools as { name: string; annotations: { readOnlyHint: boolean }; inputSchema: { type: string } }[];
        expect(tools.map(t => t.name).sort()).toEqual(TOOLS.map(t => t.name).sort());
        expect(tools.every(t => t.annotations.readOnlyHint && t.inputSchema.type === 'object')).toBe(true);
    });

    it("runs tools, accepts ?key= and reports bad input as a tool error", async () => {
        const gas = await rpc('tools/call', { name: 'get_gas', arguments: {} }, { query: key });
        expect(JSON.parse(gas.json.result.content[0].text)).toEqual({ currentBlock: 100, nextBaseFeeGwei: 1.5, estimates: [{ confidence: 99, price: 2 }] });
        const bad = await rpc('tools/call', { name: 'get_wallet_portfolio', arguments: { address: 'x' } }, { header: key });
        expect(bad.json.result?.isError ?? !!bad.json.error).toBe(true);
    });

    it("stops at the daily quota", async () => {
        const [{ id: keyId }] = await db.select({ id: apiKeys.id }).from(apiKeys);
        await db.insert(apiKeyUsage).values({ keyId, day: new Date().toISOString().slice(0, 10), calls: DAILY_TOOL_CALLS });
        const { json } = await rpc('tools/call', { name: 'get_gas', arguments: {} }, { header: key });
        expect(json.result.isError).toBe(true);
        expect(json.result.content[0].text).toContain('resets at 00:00 UTC');
    });
});
