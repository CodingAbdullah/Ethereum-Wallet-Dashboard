import { describe, expect, it, vi } from "vitest";
import { json, mockFetch, postRequest } from "@/test/helpers";
import fixture from "@/test/fixtures/moralis-wallet-insights.json";
import { POST } from "./route";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("/api/wallet-insights", () => {
    it("rejects an invalid address before calling Moralis", async () => {
        const fetchMock = mockFetch();
        const response = await POST(postRequest({ address: 'nope' }));
        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns approvals, DeFi positions and activity for one wallet", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/approvals')) return json(fixture.approvals);
            if (url.includes('/defi/positions')) return json(fixture.defi);
            return json(fixture.history);
        });
        const response = await POST(postRequest({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', network: 'eth' }));
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.approvals.items).toHaveLength(2);
        expect(body.defi.items).toHaveLength(2);
        expect(body.activity.items).toHaveLength(3);
    });
});
