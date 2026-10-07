import { coingecko, getTopMarkets, getTrending, CG_CACHE, type CoinMarket } from "./providers/coingecko";
import { getChains, getDexVolume, getStablecoins } from "./defi";
import { getDerivatives } from "./derivatives";
import { circulatingSupply, stakedEth } from "./ethSupply";
import { summarizeStaking } from "./stakingOverview";

// The data behind the hourly AI market insights: CoinGecko market data, plus DeFi (DefiLlama),
// ETH derivatives (Deribit, OKX, Bybit) and staking. The extra sources are optional: if one is down,
// it is left out and the analysis still runs.

interface GlobalData {
    data: {
        total_market_cap: { usd: number };
        total_volume: { usd: number };
        market_cap_percentage: Record<string, number>;
        market_cap_change_percentage_24h_usd: number;
    };
}

const round = (n: number | null | undefined, digits = 2) => n == null ? null : Number(n.toFixed(digits));
const pct = (fraction: number | null | undefined, digits = 4) => fraction == null ? null : round(fraction * 100, digits);

async function optional<T>(load: () => Promise<T>): Promise<T | null> {
    try {
        return await load();
    }
    catch {
        return null;
    }
}

const coinSummary = (coin: CoinMarket) => ({
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    price_usd: coin.current_price,
    change_24h_percent: coin.price_change_percentage_24h,
    market_cap_usd: coin.market_cap
});

export async function getMarketData() {
    const [global, markets, trending, chains, dexs, stablecoins, derivatives, staking] = await Promise.all([
        coingecko<GlobalData>('/global', CG_CACHE.global),
        getTopMarkets(),
        getTrending(),
        optional(getChains),
        optional(getDexVolume),
        optional(getStablecoins),
        optional(getDerivatives),
        optional(async () => summarizeStaking(await stakedEth(), await circulatingSupply()))
    ]);

    const byChange = [...markets].filter(coin => coin.price_change_percentage_24h !== null)
        .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));

    const options = derivatives && 'data' in derivatives.options ? derivatives.options.data : null;
    const perps = derivatives?.perps.flatMap(p => 'data' in p.result ? [p.result.data] : []) ?? [];

    return {
        global: {
            total_market_cap_usd: global.data.total_market_cap.usd,
            total_volume_usd: global.data.total_volume.usd,
            market_cap_change_24h_percent: global.data.market_cap_change_percentage_24h_usd,
            btc_dominance_percent: global.data.market_cap_percentage.btc,
            eth_dominance_percent: global.data.market_cap_percentage.eth
        },
        top_coins: markets.slice(0, 10).map(coinSummary),
        top_gainers: byChange.slice(0, 5).map(coinSummary),
        top_losers: byChange.slice(-5).reverse().map(coinSummary),
        trending: (trending.coins as { item: { name: string; symbol: string; market_cap_rank: number } }[])
            .slice(0, 7)
            .map(({ item }) => ({ name: item.name, symbol: item.symbol, market_cap_rank: item.market_cap_rank })),
        defi: chains || dexs || stablecoins ? {
            total_tvl_usd: chains ? Math.round(chains.reduce((s, c) => s + c.tvl, 0)) : null,
            top_chains_by_tvl: chains?.slice(0, 5).map(c => ({ name: c.name, tvl_usd: Math.round(c.tvl), share_percent: round(c.share * 100, 1) })) ?? null,
            dex_volume_24h_usd: dexs?.total24h ?? null,
            dex_volume_change_1d_percent: round(dexs?.change1d),
            stablecoin_supply_usd: stablecoins ? Math.round(stablecoins.total) : null
        } : null,
        eth_derivatives: derivatives ? {
            average_funding_8h_percent: pct(derivatives.averageFunding8h),
            total_perp_open_interest_usd: derivatives.totalOpenInterestUsd,
            perps: perps.map(p => ({ exchange: p.exchange, funding_8h_percent: pct(p.funding8h), open_interest_usd: p.openInterestUsd })),
            options_put_call_ratio: round(options?.putCallRatio),
            options_open_interest_usd: options?.openInterestUsd ?? null
        } : null,
        eth_staking: staking && staking.stakedEth !== null ? {
            staked_eth: Math.round(staking.stakedEth),
            staking_ratio_percent: pct(staking.stakingRatio, 1),
            base_apr_percent: round(staking.baseApr, 2)
        } : null
    };
}
