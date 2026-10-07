import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getMarketData } from "@/lib/marketInsights";
import { withErrorHandling } from "@/lib/api/route";
import { MARKET_INSIGHTS_PROMPT } from "@/app/utils/constants/MarketInsightsPrompt";

// AI market insights from free data: CoinGecko (already cached for other pages), DefiLlama, public
// derivatives APIs and staking data, analysed by Groq's free tier. The analysis is generated at most
// once an hour and shared by every visitor.
const getMarketInsights = unstable_cache(async () => {
    const marketData = await getMarketData();

    const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: `Analyze the following cryptocurrency market data and provide insights. Fields that are null were unavailable; don't guess them.
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
