import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json();

    // Request ERC20 token information
    const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + body.contract;

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    }

    // Safely fetching data using the FETCH API
    const response = await fetch(PRO_COINGECKO_URL + ERC20_INFO_ENDPOINT, options); // Fetch ERC20 token prices by interval

    // Return data based on status of FETCH request
    if (!response.ok) {
        return NextResponse.json({
            message: "Could not fetch ERC20 coin data"
        }, { status: 400 });
    }
    else {
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
}