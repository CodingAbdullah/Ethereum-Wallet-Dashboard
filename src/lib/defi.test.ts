import { describe, expect, it, vi } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import fx from "@/test/fixtures/defillama.json";
import { getDefiOverview, toChains, toProtocols, toStablecoins, toTvlHistory, toVolumeOverview, toYields } from "./defi";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

describe("DefiLlama parsers", () => {
    it("ranks chains by TVL with their share", () => {
        const chains = toChains(fx.chains);
        expect(chains.map(c => c.name)).toEqual(['Ethereum', 'Solana', 'Base']);
        expect(chains[0].share).toBeCloseTo(0.75);
    });

    it("ranks protocols, leaving out CEXs and empty entries", () => {
        const protocols = toProtocols(fx.protocols);
        expect(protocols.map(p => p.name)).toEqual(['Lido', 'Aave V3']);
        expect(protocols[0]).toMatchObject({ chains: 2, change1d: 1.2, change7d: -3.4, url: 'https://lido.fi' });
    });

    it("turns TVL history into days and skips bad points", () => {
        expect(toTvlHistory(fx.tvlHistory)).toEqual([
            { day: '2024-09-30', tvl: 90000000000 },
            { day: '2024-10-01', tvl: 91000000000 }
        ]);
    });

    it("reads DEX volume and fee overviews", () => {
        const dexs = toVolumeOverview(fx.dexs);
        expect(dexs).toMatchObject({ total24h: 5000000000, change1d: 4.5 });
        expect(dexs.top.map(d => d.name)).toEqual(['Uniswap V3', 'Curve DEX']);
    });

    it("sums only USD stablecoins", () => {
        const s = toStablecoins(fx.stablecoins);
        expect(s.total).toBe(180000000000);
        expect(s.top.map(c => c.symbol)).toEqual(['USDT', 'USDC', 'EURC']);
    });

    it("keeps yields on large pools and drops extreme APYs", () => {
        expect(toYields(fx.yields).map(p => p.project)).toEqual(['aave-v3', 'lido']);
    });

    it("tolerates unexpected shapes", () => {
        expect(toChains(null)).toEqual([]);
        expect(toProtocols({})).toEqual([]);
        expect(toVolumeOverview(undefined)).toEqual({ total24h: null, total7d: null, change1d: null, top: [] });
        expect(toStablecoins([])).toEqual({ total: 0, top: [] });
    });
});

describe("getDefiOverview", () => {
    it("returns every section, and an error only for the ones that fail", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/v2/chains')) return json(fx.chains);
            if (url.endsWith('/protocols')) return json(fx.protocols);
            if (url.includes('historicalChainTvl')) return json(fx.tvlHistory);
            if (url.includes('/overview/dexs')) return json(fx.dexs);
            if (url.includes('/overview/fees')) return json(fx.dexs);
            if (url.includes('stablecoins.llama.fi')) return json(fx.stablecoins);
            if (url.includes('yields.llama.fi')) return json({ message: 'Pro plan required' }, 402);
            throw new Error('Unexpected ' + url);
        });

        const overview = await getDefiOverview();
        expect('data' in overview.chains && overview.chains.data).toHaveLength(3);
        expect('data' in overview.stablecoins && overview.stablecoins.data.total).toBe(180000000000);
        expect(overview.yields).toEqual({ error: "Not available on DefiLlama's free API" });
    });
});
