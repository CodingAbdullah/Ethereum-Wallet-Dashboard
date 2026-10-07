import { describe, expect, it, vi } from "vitest";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
const EMPTY = '0x2222222222222222222222222222222222222222';
vi.mock("@/lib/providers/rpc", () => ({
    chainClient: vi.fn(() => ({
        simulateCalls: vi.fn(async () => ({ results: [{ status: 'success', gasUsed: BigInt(50000) }], assetChanges: [] })),
        getGasPrice: vi.fn(async () => BigInt(2_000_000_000)),
        getCode: vi.fn(async ({ address }: { address: string }) => address.toLowerCase() === EMPTY ? undefined : '0x6080')
    }))
}));
vi.mock("@/lib/providers/http", async importOriginal => ({
    ...await importOriginal<object>(),
    providerFetch: vi.fn(async (_p: string, url: string) => url.includes('address_security') ? { result: { phishing_activities: '1' } } : { result: {} })
}));

import { POST } from "./route";

const FROM = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const TOKEN = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const SPENDER = '0x1111111111111111111111111111111111111111';

describe("/api/simulate", () => {
    it("simulates and returns fee and risk flags", async () => {
        const data = encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [SPENDER, maxUint256] });
        const response = await POST(postRequest({ chain: 'base', from: FROM, calls: [{ to: TOKEN, data }] }));
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.simulation).toMatchObject({ ok: true, gasUsed: '50000' });
        expect(body.fee).toEqual({ gasPriceGwei: 2, estimate: 0.0001, symbol: 'ETH' });
        expect(body.flags.map((f: { text: string }) => f.text).join(' ')).toMatch(/Unlimited approval[^]*flagged by GoPlus for phishing/);
    });

    it("refuses function calls to addresses with no contract", async () => {
        const response = await POST(postRequest({ chain: 'eth', from: FROM, calls: [{ to: EMPTY, data: '0xd0e30db0', value: '1' }] }));
        const body = await response.json();
        expect(body.simulation.ok).toBe(false);
        expect(body.simulation.error).toContain('There is no contract at');
        // Plain value transfers to wallets are fine
        const send = await (await POST(postRequest({ chain: 'eth', from: FROM, calls: [{ to: EMPTY, value: '1' }] }))).json();
        expect(send.simulation.ok).toBe(true);
    });

    it("validates the request", async () => {
        expect((await POST(postRequest({ chain: 'solana', from: FROM, calls: [{ to: TOKEN }] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', from: 'nope', calls: [{ to: TOKEN }] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', from: FROM, calls: [] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', from: FROM, calls: [{ to: TOKEN, value: '-1' }] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', from: FROM, calls: [{ to: TOKEN, data: 'zz' }] }))).status).toBe(400);
    });
});
