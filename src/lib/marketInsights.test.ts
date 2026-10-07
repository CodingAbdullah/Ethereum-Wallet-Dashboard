import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./providers/coingecko", () => ({
    CG_CACHE: { global: 60 },
    coingecko: vi.fn(async () => ({ data: { total_market_cap: { usd: 3e12 }, total_volume: { usd: 1e11 }, market_cap_percentage: { btc: 55, eth: 12 }, market_cap_change_percentage_24h_usd: 1.5 } })),
    getTopMarkets: vi.fn(async () => [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 60000, market_cap: 1.2e12, price_change_percentage_24h: 2 },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 3.6e11, price_change_percentage_24h: -1 }
    ]),
    getTrending: vi.fn(async () => ({ coins: [{ item: { name: 'Pepe', symbol: 'PEPE', market_cap_rank: 30 } }], nfts: [] }))
}));
vi.mock("./defi", () => ({
    getChains: vi.fn(async () => [{ name: 'Ethereum', tvl: 6e10, share: 0.6, tokenSymbol: 'ETH' }, { name: 'Solana', tvl: 4e10, share: 0.4, tokenSymbol: 'SOL' }]),
    getDexVolume: vi.fn(async () => ({ total24h: 5e9, total7d: null, change1d: 3.21, top: [] })),
    getStablecoins: vi.fn(async () => ({ total: 2.5e11, top: [] }))
}));
vi.mock("./derivatives", () => ({
    getDerivatives: vi.fn(async () => ({
        perps: [{ exchange: 'OKX', result: { data: { exchange: 'OKX', funding8h: 0.0001, openInterestUsd: 2e9 } } }, { exchange: 'Bybit', result: { error: 'down' } }],
        averageFunding8h: 0.0001, totalOpenInterestUsd: 2e9,
        options: { data: { putCallRatio: 0.654, openInterestUsd: 5e9 } }
    }))
}));
vi.mock("./ethSupply", async importOriginal => ({ ...await importOriginal<object>(), stakedEth: vi.fn(async () => 34_000_000), circulatingSupply: vi.fn(async () => 120_000_000) }));

import { getChains, getDexVolume, getStablecoins } from "./defi";
import { getDerivatives } from "./derivatives";
import { stakedEth } from "./ethSupply";
import { getMarketData } from "./marketInsights";

beforeEach(() => vi.clearAllMocks());

describe("getMarketData", () => {
    it("adds DeFi, derivatives and staking data to the CoinGecko data", async () => {
        const data = await getMarketData();
        expect(data.global.eth_dominance_percent).toBe(12);
        expect(data.top_gainers[0].symbol).toBe('BTC');
        expect(data.defi).toEqual({
            total_tvl_usd: 1e11, top_chains_by_tvl: [{ name: 'Ethereum', tvl_usd: 6e10, share_percent: 60 }, { name: 'Solana', tvl_usd: 4e10, share_percent: 40 }],
            dex_volume_24h_usd: 5e9, dex_volume_change_1d_percent: 3.21, stablecoin_supply_usd: 2.5e11
        });
        expect(data.eth_derivatives).toMatchObject({ average_funding_8h_percent: 0.01, perps: [{ exchange: 'OKX', funding_8h_percent: 0.01, open_interest_usd: 2e9 }], options_put_call_ratio: 0.65 });
        expect(data.eth_staking).toMatchObject({ staked_eth: 34_000_000, staking_ratio_percent: 28.3 });
        expect(data.eth_staking!.base_apr_percent).toBeGreaterThan(1);
        expect(data.eth_staking!.base_apr_percent).toBeLessThan(5);
    });

    it("leaves out sources that fail instead of failing", async () => {
        vi.mocked(getChains).mockRejectedValueOnce(new Error('down'));
        vi.mocked(getDexVolume).mockRejectedValueOnce(new Error('down'));
        vi.mocked(getStablecoins).mockRejectedValueOnce(new Error('down'));
        vi.mocked(getDerivatives).mockRejectedValueOnce(new Error('down'));
        vi.mocked(stakedEth).mockRejectedValueOnce(new Error('down'));
        const data = await getMarketData();
        expect(data.defi).toBeNull();
        expect(data.eth_derivatives).toBeNull();
        expect(data.eth_staking).toBeNull();
        expect(data.top_coins).toHaveLength(2);
    });
});
