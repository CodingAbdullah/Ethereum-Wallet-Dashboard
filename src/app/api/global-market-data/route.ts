import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function GET(){
    const GLOBALMARKETDATA_ENDPOINT = '/global';

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_2 // API-KEY for authenticated call
        } as HeadersInit
    }

    // Fetch data based on options parameters
    const response = await fetch(PRO_COINGECKO_URL + GLOBALMARKETDATA_ENDPOINT, options); // Fetch data related to the global market
    
    // Return response based on data fetch
    if (!response.ok) {
        return NextResponse.json({
            message: "Could not fetch global market data"
        }, { status: 400 });
    }
    else {
        // Send back as response, global market data
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
}