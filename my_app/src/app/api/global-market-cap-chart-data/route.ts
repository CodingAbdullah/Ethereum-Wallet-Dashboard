import { NextResponse } from "next/server";
import dayjs from "dayjs";

// Pro CoinGecko API Endpoint
const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";

// Custom Route Handler function
export async function GET(){

    // Endpoint for fetching Global Cryptocurrency Market Cap data in the last 30 days
    const MARKET_DATA_ENDPOINT = "/global/market_cap_chart?days=30";
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } as HeadersInit
    };

    // Pass in options containing API Key to make authenticated call to get market cap data
    const response = await fetch(PRO_COINGECKO_URL + MARKET_DATA_ENDPOINT, options);
    
    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        // Return modified date/price data
        const data = await response.json();
        const marketCapData: [string, string] = data.market_cap_chart.market_cap;               
        
        return NextResponse.json({
            capValues: marketCapData.map(cap => ({ 
                date: dayjs(cap[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[0], 
                price: Number(Number(cap[1])) 
            }))
        });
    }
}