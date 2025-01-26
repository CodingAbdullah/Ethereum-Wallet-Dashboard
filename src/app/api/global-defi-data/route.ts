import { NextResponse } from "next/server";

// Pro CoinGecko API Endpoint
const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";

// Custom Route Handler function
export async function GET(){
    const DEFI_ENDPOINT = "/global/decentralized_finance_defi";
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } as HeadersInit
    }

    // Pass in address and chain values and make request
    const response = await fetch(PRO_COINGECKO_URL + DEFI_ENDPOINT, options);

    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}