import { describe, expect, it, vi } from "vitest";
import { json, mockFetch, postRequest } from "@/test/helpers";
import { POST } from "./route";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

describe("/api/token-risk", () => {
    it("validates input before calling GoPlus", async () => {
        const fetchMock = mockFetch();
        expect((await POST(postRequest({ chain: 'eth', addresses: [] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', addresses: ['nope'] }))).status).toBe(400);
        expect((await POST(postRequest({ chain: 'eth', addresses: Array(31).fill(USDC) }))).status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("skips testnets and returns risks for mainnet tokens", async () => {
        const fetchMock = mockFetch(json({ code: 1, result: { [USDC.toLowerCase()]: { is_proxy: '1', trust_list: '1' } } }));
        expect(await (await POST(postRequest({ chain: 'sepolia', addresses: [USDC] }))).json()).toEqual({});
        expect(fetchMock).not.toHaveBeenCalled();
        const risks = await (await POST(postRequest({ chain: 'eth', addresses: [USDC] }))).json();
        expect(risks[USDC.toLowerCase()]).toMatchObject({ level: 'ok', trusted: true });
    });
});
