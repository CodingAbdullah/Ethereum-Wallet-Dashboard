import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function GET(){
    const TOP_BOTTOM_COINS_ENDPOINT = "/coins/top_gainers_losers?vs_currency=usd";
    
    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_CHART_DATA_API_KEY
        } as HeadersInit
    }

    // Make an API call to fetch top and bottom coins
    const response = await fetch(PRO_COINGECKO_URL + TOP_BOTTOM_COINS_ENDPOINT, options);
    
    // Fetch data using the Ethereum data endpoints
    if (!response.ok)
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}