import { providerFetch } from "./http";

// CoinGecko free Demo API (https://www.coingecko.com/en/api/pricing)
// The Demo plan has a monthly call cap, so every call is cached in the Next.js data cache.
// Identical URLs share one cache entry, so routes reuse the same queries where possible.
const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// Cache durations (seconds), tuned to stay inside the Demo plan's monthly quota
export const CG_CACHE = {
    markets: 900,
    global: 3600,
    trending: 1800,
    lookup: 1800,
    chart: 3600,
    longChart: 21600
} as const;

export function coingecko<T>(path: string, revalidate: number = CG_CACHE.lookup): Promise<T> {
    return providerFetch<T>('CoinGecko', COINGECKO_URL + path, {
        headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY },
        revalidate
    });
}

// One shared query for the top 250 coins, used by the prices table and the top gainers/losers tables
export const TOP_MARKETS_PATH = '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h';

export interface CoinMarket {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_percentage_24h: number | null;
    circulating_supply?: number | null;
}

export function getTopMarkets(): Promise<CoinMarket[]> {
    return coingecko<CoinMarket[]>(TOP_MARKETS_PATH, CG_CACHE.markets);
}

// Trending coins and NFTs, shared by the trending tables and the top collections table
export interface TrendingNft {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    native_currency_symbol: string;
    floor_price_in_native_currency: number;
    floor_price_24h_percentage_change: number;
    data: {
        floor_price: string;
        floor_price_in_usd_24h_percentage_change: string;
        h24_volume: string;
        h24_average_sale_price: string;
    };
}

export function getTrending(): Promise<{ coins: unknown[]; nfts: TrendingNft[] }> {
    return coingecko('/search/trending', CG_CACHE.trending);
}
