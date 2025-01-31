import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    // QUERY STRING along with CURRENCY ENDPOINT
    const QUERY_STRING = '?ids=' + body.coin + '&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    
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

    // Fetch current coin price information using the coin ID provided by user
    const response = await fetch(PRO_COINGECKO_URL + CURRENCY_ENDPOINT + QUERY_STRING, options); // Fetch current coin price
    
    // Return data based on status of fetch request
    if (response.ok) {
        const information = await response.json();
        coinInfo.push(information);

        return NextResponse.json({
            coinInfoData: coinInfo
        });
    }
    else {
        return NextResponse.json({
            message: "Could not retrieve data"
        }, { status: 400 });
    }
}