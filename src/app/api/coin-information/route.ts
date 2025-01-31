import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

export async function POST(request: Request) {
    const body = await request.json(); // Retrieve request information
    
    // QUERY STRING along with CURRENCY ENDPOINT
    const CURRENCY_ENDPOINT = '/coins/' + body.coin;

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    }

    const coinInfo = [];

    // Fetch coin information using the coin ID provided by the user
    const response = await fetch(PRO_COINGECKO_URL + CURRENCY_ENDPOINT, options); // Fetch coin information   
    
    if (!response.ok) {
        NextResponse.json({
            message: "Could not fetch information"
        }, { status: 400 });
    }
    else {
        const data = await response.json();
        
        // Push data to response object and returns
        coinInfo.push(data);
        NextResponse.json({
            coinInfoData: coinInfo
        });
    }
}