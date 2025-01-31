// Firecrawl API fetches data from this Cryptocurrency website (coingecko.com)
// LLM Data processed from website, ensure it conforms to standards (key components of the data), marked using Zod
// Schema/Structured data passed as a tool?.. to the AI SDK (we use the deepseek AI model) 
import FirecrawlApp from "@mendable/firecrawl-js";
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import marketSchema from "@/app/utils/constants/MarketSchema";
import AITextGeneratedSchema from "@/app/utils/constants/AITextGeneratedSchema";

export const runtime = "edge";

export async function GET() {
    // Setting up the Firecrawl app
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    // Retrieve the web scraping result from the Coin Gecko webpage
    const scrapeResult = await app.scrapeUrl("https://coingecko.com/", {
        formats: ["json"],
        jsonOptions: { schema: marketSchema }
    });

    // Conditionally render the scraping data from the Firecrawl API call
    if (!scrapeResult.success) {
        return NextResponse.json({ error: 'Failed to fetch market insights' }, { status: 500 });
    } 
    else {
        // Create a readable stream of content
        // Utilize the generate object function for this task
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const { object } = await generateObject({
                        model: openai("gpt-4o"),
                        schema: AITextGeneratedSchema,
                        prompt: `Analyze the following cryptocurrency market data and provide insights:
                                ${JSON.stringify(scrapeResult.json, null, 2)}
                                    Provide a detailed analysis including a summary, Bitcoin analysis, Ethereum analysis, 
                                    overall market overview, analysis of trending coins, analysis of top gainers, and a conclusion.`
                    }) as { object: Record<string, string> };

                    // Stream each part of the analysis
                    for (const key in object) {
                        const chunk = `${key}: ${object[key]}\n\n`;
                        controller.enqueue(new TextEncoder().encode(chunk));
                        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay between chunks
                    }
                    controller.close();
                } 
                catch (error) {
                    controller.error(error);
                }
            }
        });

        // Return stream back as a response
        return new NextResponse(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
    }
}