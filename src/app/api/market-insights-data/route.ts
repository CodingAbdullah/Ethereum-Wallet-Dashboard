// Firecrawl API fetches data from this Cryptocurrency website (coingecko.com)
// LLM Data processed from website, ensure it conforms to standards (key components of the data), marked using Zod
// Schema/Structured data passed as a tool to the AI SDK using the Open AI model
import FirecrawlApp from "@mendable/firecrawl-js";
import { groq } from '@ai-sdk/groq';
import { NextResponse } from "next/server";
import { streamText } from 'ai';
import marketSchema from "@/app/utils/constants/MarketSchema";
import { MARKET_INSIGHTS_PROMPT } from "@/app/utils/constants/MarketInsightsPrompt";

export async function GET() {
    try {
        // Check if the API key is set
        const apiKey = process.env.FIRECRAWL_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is not set' }, { status: 500 });
        }
        
        // Setting up the Firecrawl app
        const app = new FirecrawlApp({ apiKey });

        // Retrieve the web scraping result from the Coin Gecko webpage
        // Utilize the Market Schema created using Zod for guidance
        const scrapeResult = await app.scrapeUrl("https://coingecko.com/", {
            formats: ["json"],
            jsonOptions: { schema: marketSchema },
            timeout: 30000
        });

        // Conditionally return data from the Firecrawl API call
        if (!scrapeResult.success) {
            return NextResponse.json({ error: 'Failed to fetch market insights' }, { status: 500 });
        }

        // Stream AI-generated market insights
        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: `Analyze the following cryptocurrency market data and provide comprehensive insights:
              ${JSON.stringify(scrapeResult.json, null, 2)}
              
              ${MARKET_INSIGHTS_PROMPT}`
        });

        return result.toTextStreamResponse();
    } 
    catch (err) {
        return NextResponse.json({ error: 'Internal server error: ' + err }, { status: 500 });
    }
}