import { NextResponse } from "next/server";
import { getTopMarkets, CoinMarket } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

const MOVERS_COUNT = 30;
const MIN_VOLUME_USD = 50000;

// Top gainers and losers over 24 hours.
// CoinGecko's top_gainers_losers endpoint is paid-only, so this ranks the free top-250 markets query instead.
export const GET = withErrorHandling(async () => {
    const markets = (await getTopMarkets()).filter(coin => coin.price_change_percentage_24h !== null && coin.total_volume >= MIN_VOLUME_USD);
    const byChange = [...markets].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));

    const toMover = (coin: CoinMarket) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        usd: coin.current_price,
        market_cap_rank: coin.market_cap_rank,
        usd_24h_change: coin.price_change_percentage_24h
    });

    return NextResponse.json({
        top_gainers: byChange.slice(0, MOVERS_COUNT).map(toMover),
        top_losers: byChange.slice(-MOVERS_COUNT).reverse().map(toMover)
    });
});
