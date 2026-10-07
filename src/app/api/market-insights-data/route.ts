import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { coingecko, getTopMarkets, getTrending, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";
import { MARKET_INSIGHTS_PROMPT } from "@/app/utils/constants/MarketInsightsPrompt";

interface GlobalData {
    data: {
        total_market_cap: { usd: number };
        total_volume: { usd: number };
        market_cap_percentage: Record<string, number>;
        market_cap_change_percentage_24h_usd: number;
    };
}

// AI market insights from CoinGecko Demo data (already cached for other pages) and Groq's free tier.
// Replaces scraping coingecko.com with Firecrawl, which needed paid credits.
// The analysis is generated at most once an hour and shared by every visitor.
const getMarketInsights = unstable_cache(async () => {
    const [global, markets, trending] = await Promise.all([
        coingecko<GlobalData>('/global', CG_CACHE.global),
        getTopMarkets(),
        getTrending()
    ]);

    const coinSummary = (coin: (typeof markets)[number]) => ({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price_usd: coin.current_price,
        change_24h_percent: coin.price_change_percentage_24h,
        market_cap_usd: coin.market_cap
    });

    const byChange = [...markets].filter(coin => coin.price_change_percentage_24h !== null)
        .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));

    const marketData = {
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
            .map(({ item }) => ({ name: item.name, symbol: item.symbol, market_cap_rank: item.market_cap_rank }))
    };

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: `Analyze the following cryptocurrency market data and provide comprehensive insights:
${JSON.stringify(marketData, null, 2)}

${MARKET_INSIGHTS_PROMPT}`
    });

    return text;
}, ['market-insights'], { revalidate: 3600 });

export const GET = withErrorHandling(async () => {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    return new Response(await getMarketInsights(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
});
