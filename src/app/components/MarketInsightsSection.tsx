"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

// Market Insights Section Custom Component
export default function MarketInsightsSection() {
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)

  // Upon page mount, make the back-end call to fetch streaming market data
  useEffect(() => {
    async function fetchMarketInsights() {
        try {
            setIsStreaming(true);
            
            const response = await fetch("/api/market-insights-data");

            // Return error, if request call is not successful
            if (!response.ok) {
                throw new Error("Failed to fetch market insights data");
            }
            
            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
                throw new Error("No reader available");
            }
            
            let accumulatedContent = "";
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                
                // Process each character individually for smooth streaming
                for (let i = 0; i < chunk.length; i++) {
                    accumulatedContent += chunk[i];
                    setContent(accumulatedContent);
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
            }
        } 
        catch (error) {
            setContent("Failed to load market insights. Please try again later." + error);
            setIsLoading(false);
        } 
        finally {
            setIsStreaming(false);
            setIsLoading(false);
        }
    }

    fetchMarketInsights();
  }, []);

    // Conditionally render component
    if (isLoading && !isStreaming && !content) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-300 mb-4"></div>
                <p className="text-gray-400 text-lg">Fetching market insights...</p>
                <p className="text-gray-500 text-sm mt-2">This may take 15-30 seconds</p>
            </div>
        )
    }

    // Finally, load the Market Insights Section component containing the streaming data
    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Bot size={24} className="text-gray-300" />
                    </div>
                    <div className="flex-grow bg-gray-800 rounded-lg p-4 shadow-lg overflow-y-auto max-h-[calc(100vh-2rem)]">
                        <div className="text-gray-400 whitespace-pre-wrap">
                            {content}
                            {isStreaming && (
                                <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1"></span>
                            )}
                        </div>
                        {!content && isStreaming && (
                            <div className="flex items-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500 mr-2"></div>
                                Analyzing market data and generating insights...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}