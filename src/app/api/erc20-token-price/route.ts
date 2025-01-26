import { NextResponse } from "next/server";

// Set MORALIS URL and endpoint for request
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';
const erc20Endpoint = 'erc20/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json();  // Retrieve information from request

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } as HeadersInit
    }

    // Fetch data based on parameter values
    const response = await fetch(MORALIS_URL + erc20Endpoint + body.address + '/price', options) // Pass in address and chain values
    
    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}