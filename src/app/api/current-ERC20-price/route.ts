import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    
    // Endpoint for fetching ERC20 token price
    const ERC20_PRICE_ENDPOINT = '/simple/token_price/ethereum?contract_addresses=' + body.contract + '&vs_currencies=usd';

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    }

    // Safely fetching data using axios, escaping with try-catch block
    const response = await fetch(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval
    
    if (!response.ok) {
        NextResponse.json({
            message: "Could not fetch ERC20 coin data"
        }, { status : 400 });
    }
    else {
        const information = await response.json();
        NextResponse.json({
            price: information[Object.keys(information)[0]].usd
        });
    }
}