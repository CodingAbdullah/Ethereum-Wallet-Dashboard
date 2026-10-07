import { describe, expect, it } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { getDexPools, toPools } from "./dexPools";

const page = { data: [
    {
        id: 'eth_0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', type: 'pool',
        attributes: { name: 'USDC / WETH 0.05%', address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', base_token_price_usd: '1.0001', reserve_in_usd: '250000000.5', pool_created_at: '2021-05-05T21:42:11Z',
            price_change_percentage: { h1: '0.01', h24: '-0.12' }, transactions: { h24: { buys: 1200, sells: 1100 } }, volume_usd: { h24: '300000000' } },
        relationships: { base_token: { data: { id: 'eth_0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', type: 'token' } }, dex: { data: { id: 'uniswap_v3', type: 'dex' } } }
    },
    { id: 'junk', attributes: {} }
] };

describe("toPools", () => {
    it("reads pools from GeckoTerminal's JSON:API format", () => {
        expect(toPools(page)).toEqual([{
            address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', name: 'USDC / WETH 0.05%', dex: 'uniswap v3',
            baseToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', priceUsd: 1.0001, liquidityUsd: 250000000.5, volume24hUsd: 3e8,
            change24h: -0.12, buys24h: 1200, sells24h: 1100, createdAt: '2021-05-05T21:42:11Z'
        }]);
        expect(toPools(null)).toEqual([]);
    });
});

describe("getDexPools", () => {
    it("uses GeckoTerminal's network names and fails each list on its own", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => String(input).includes('trending') ? json(page) : json({}, 500));
        const pools = await getDexPools('polygon');
        expect(String(fetchMock.mock.calls[0][0])).toContain('/networks/polygon_pos/');
        expect('data' in pools.trending && pools.trending.data).toHaveLength(1);
        expect(pools.latest).toEqual({ error: 'GeckoTerminal is unavailable right now' });
    });
});
