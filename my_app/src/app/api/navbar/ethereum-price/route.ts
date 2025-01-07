import { NextResponse } from 'next/server';

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Async function for working with Ethereum pricing
async function fetchEthereumPrice() {
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_NAVBAR_API_KEY ?? '' // API-KEY for authenticated call
        } as HeadersInit
    } 
    
    const res = await fetch(PRO_COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM, options);

    // Fetch data using the Ethereum data endpoints
    if (!res.ok) 
        throw new Error('Failed to fetch Ethereum price');
    
    return res.json();
}

// Main route function for handling request
export async function GET() {
    try {
        const data = await fetchEthereumPrice();
        return NextResponse.json(data);
    } 
    catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    }
}