import { describe, expect, it, vi } from "vitest";
import markets from "@/test/fixtures/coingecko-markets.json";

vi.mock("@/lib/providers/coingecko", () => ({ getTopMarkets: vi.fn(async () => markets) }));

const { GET } = await import("./route");

describe("GET /api/top-bottom-coin-prices", () => {
    it("ranks gainers and losers from the free markets query", async () => {
        const data = await (await GET()).json();

        expect(data.top_gainers[0]).toMatchObject({ id: "pump-coin", usd: 0.5, usd_24h_change: 42.1, market_cap_rank: 180 });
        expect(data.top_losers[0]).toMatchObject({ id: "dump-coin", usd_24h_change: -18.6 });
    });

    it("skips coins under $50k volume and coins without a 24h change", async () => {
        const data = await (await GET()).json();
        const ids = [...data.top_gainers, ...data.top_losers].map((coin: { id: string }) => coin.id);

        expect(ids).not.toContain("illiquid-coin");
        expect(ids).not.toContain("new-listing");
    });
});
