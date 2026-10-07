import { beforeEach, describe, expect, it, vi } from "vitest";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/gas", () => ({
    getGasEstimate: vi.fn(async () => ({ currentBlockNumber: 100, blockPrices: [{ blockNumber: 101, baseFeePerGas: 1.5, estimatedPrices: [{ confidence: 99, price: 2 }] }] }))
}));

const usage = { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 5, text: 5, reasoning: undefined } };
const finish = (reason: 'tool-calls' | 'stop') => ({ type: 'finish' as const, finishReason: { unified: reason, raw: undefined }, logprobs: undefined, usage });
let model: MockLanguageModelV4;
vi.mock("@ai-sdk/groq", () => ({ groq: () => model }));

const WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const ask = (text: string, extra: Record<string, unknown> = {}) => postRequest({ messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text }] }], ...extra });

beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', 'test');
    model = new MockLanguageModelV4({
        doStream: [
            { stream: simulateReadableStream({ chunks: [{ type: 'tool-call', toolCallId: 'c1', toolName: 'get_gas', input: '{}' }, finish('tool-calls')] }) },
            { stream: simulateReadableStream({ chunks: [{ type: 'text-start', id: 't' }, { type: 'text-delta', id: 't', delta: 'Gas is 2 gwei.' }, { type: 'text-end', id: 't' }, finish('stop')] }) }
        ]
    });
});

describe("/api/agent", () => {
    it("calls tools and streams the answer", async () => {
        const { POST } = await import("./route");
        const response = await POST(ask('How much is gas?', { wallet: WALLET.toLowerCase(), chain: 'base' }) as never);
        expect(response.status).toBe(200);
        const body = await response.text();
        expect(body).toContain('"toolName":"get_gas"');
        expect(body).toContain('"nextBaseFeeGwei":1.5');
        expect(body).toContain('Gas is 2 gwei.');

        const first = model.doStreamCalls[0];
        const system = JSON.stringify(first.prompt[0]);
        expect(system).toContain(`connected wallet is ${WALLET} on Base`);
        expect(system).toContain('You can only read data');
        expect(first.tools?.map(t => t.name)).toContain('decode_transaction');
        // The tool result goes back to the model for the second step
        expect(JSON.stringify(model.doStreamCalls[1].prompt)).toContain('nextBaseFeeGwei');
    });

    it("rejects bad requests before calling the model", async () => {
        const { POST } = await import("./route");
        expect((await POST(postRequest({ messages: [] }) as never)).status).toBe(400);
        expect((await POST(ask('x'.repeat(2001)) as never)).status).toBe(400);
        expect((await POST(ask('hi', { wallet: 'not-an-address' }) as never)).status).toBe(400);
        expect((await POST(postRequest({ messages: [{ id: 'a', role: 'assistant', parts: [{ type: 'text', text: 'hi' }] }] }) as never)).status).toBe(400);
        expect(model.doStreamCalls).toHaveLength(0);
    });

    it("needs GROQ_API_KEY", async () => {
        vi.stubEnv('GROQ_API_KEY', '');
        const { POST } = await import("./route");
        expect((await POST(ask('hi') as never)).status).toBe(503);
    });
});
