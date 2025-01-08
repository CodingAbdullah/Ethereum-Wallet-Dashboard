import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json();
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    }

    // Fetch data based on request parameters
    const data = await fetch("https://deep-index.moralis.io/api/v2.2/erc20/" + body.contract + '/transfers', options) // Pass in address value for request

    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}