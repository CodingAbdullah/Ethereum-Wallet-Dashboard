import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function GET(){
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // Trending coins in the market
    
    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3 // API-KEY for authenticated call
        } as HeadersInit
    }

    const response = await fetch(PRO_COINGECKO_URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins
    
    // Conditionally return data based on data fetch
    if (response.ok) {
        const trendingCoins = await response.json();

        // Return trending coins data
        return NextResponse.json({
            trendingCoinData: trendingCoins
        });
    }
    else {
        // Return error message
        return NextResponse.json({
            message: "Could not fetch trending coins data"
        }, { status: 400 });
    }
}