import { NextResponse } from "next/server";
import { coingecko, CG_CACHE, CoinMarket } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Top Ethereum-ecosystem tokens by market cap (CoinGecko Demo API)
export const GET = withErrorHandling(async () => {
    const markets = await coingecko<CoinMarket[]>('/coins/markets?vs_currency=usd&category=ethereum-ecosystem&order=market_cap_desc&per_page=100&page=1', CG_CACHE.markets);

    return NextResponse.json(markets.map(token => ({
        token_name: token.name ?? '',
        token_symbol: token.symbol ?? '',
        token_logo: token.image ?? '',
        price_usd: String(token.current_price ?? 0),
        market_cap_usd: String(token.market_cap ?? 0),
        price_24h_percent_change: String(token.price_change_percentage_24h ?? 0)
    })));
});
