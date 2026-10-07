import { describe, expect, it, vi } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { CHAINS } from "./chains";
import { getChainDetail, getL2Overview, toChainProtocols, toL2beat } from "./l2";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
vi.mock("./providers/rpc", () => ({
    rpcClientFor: () => ({ getBlockNumber: async () => BigInt(123456), getGasPrice: async () => BigInt(5_000_000) })
}));

const l2beatObjectLayout = {
    success: true,
    data: {
        projects: {
            arbitrum: { id: 'arbitrum', slug: 'arbitrum', name: 'Arbitrum One', category: 'Optimistic Rollup', stage: 'Stage 1', tvs: { breakdown: { total: 15e9 } } },
            base: { id: 'base', name: 'Base', type: 'layer2', category: 'Optimistic Rollup', stage: { stage: 'Stage 1' }, tvl: { breakdown: { total: 12e9 } } },
            weird: { id: 'x', stage: 'NotApplicable' }
        }
    }
};

describe("toL2beat", () => {
    it("reads object and array layouts and both stage formats", () => {
        const fromObject = toL2beat(l2beatObjectLayout);
        expect(fromObject).toEqual([
            { slug: 'arbitrum', name: 'Arbitrum One', category: 'Optimistic Rollup', stage: 'Stage 1', tvs: 15e9 },
            { slug: 'base', name: 'Base', category: 'Optimistic Rollup', stage: 'Stage 1', tvs: 12e9 }
        ]);
        expect(toL2beat({ projects: [{ slug: 'scroll', name: 'Scroll', category: 'ZK Rollup', stage: 'Stage 0' }] })[0]).toMatchObject({ slug: 'scroll', stage: 'Stage 0', tvs: null });
        expect(toL2beat('garbage')).toEqual([]);
    });
});

describe("toChainProtocols", () => {
    it("ranks protocols per chain from chainTvls, skipping CEXs and staking extras", () => {
        const result = toChainProtocols([
            { name: 'Aave V3', category: 'Lending', chainTvls: { Base: 500, Arbitrum: 900, 'Base-borrowed': 9999 } },
            { name: 'Aerodrome', category: 'Dexs', chainTvls: { Base: 800 } },
            { name: 'Some CEX', category: 'CEX', chainTvls: { Base: 1e12 } }
        ], ['Base', 'Arbitrum', 'Linea']);
        expect(result.Base.map(p => p.name)).toEqual(['Aerodrome', 'Aave V3']);
        expect(result.Arbitrum).toEqual([{ name: 'Aave V3', category: 'Lending', tvl: 900 }]);
        expect(result.Linea).toEqual([]);
    });
});

describe("getL2Overview", () => {
    it("merges DefiLlama TVL with L2BEAT stages, and still works when L2BEAT is down", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/v2/chains')) return json([{ name: 'Ethereum', tvl: 60e9 }, { name: 'Arbitrum', tvl: 3e9 }, { name: 'Base', tvl: 4e9 }]);
            if (url.includes('l2beat.com')) return json({}, 503);
            throw new Error('Unexpected ' + url);
        });

        const overview = await getL2Overview();
        expect(overview.sources).toEqual({ defillama: true, l2beat: false });
        expect(overview.ethereumTvl).toBe(60e9);
        expect(overview.rows.slice(0, 2).map(r => [r.key, r.tvl, r.stage])).toEqual([['base', 4e9, null], ['arbitrum', 3e9, null]]);
    });
});

describe("getChainDetail", () => {
    it("combines TVL, history, protocols, live RPC stats and the L2BEAT stage", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/v2/chains')) return json([{ name: 'Ethereum', tvl: 60e9 }, { name: 'Base', tvl: 4e9 }]);
            if (url.includes('/v2/historicalChainTvl/Base')) return json([{ date: 1727654400, tvl: 1 }, { date: 1727740800, tvl: 2 }]);
            if (url.endsWith('/protocols')) return json([{ name: 'Aerodrome', category: 'Dexs', chainTvls: { Base: 800 } }]);
            if (url.includes('l2beat.com')) return json(l2beatObjectLayout);
            throw new Error('Unexpected ' + url);
        });

        const detail = await getChainDetail(CHAINS.base);
        expect(detail.tvl?.tvl).toBe(4e9);
        expect('data' in detail.history && detail.history.data).toHaveLength(2);
        expect(detail.protocols).toEqual({ data: [{ name: 'Aerodrome', category: 'Dexs', tvl: 800 }] });
        expect(detail.live).toEqual({ data: { block: 123456, gasGwei: 0.005 } });
        expect(detail.l2beat).toEqual({ category: 'Optimistic Rollup', stage: 'Stage 1', tvs: 12e9 });
    });
});
