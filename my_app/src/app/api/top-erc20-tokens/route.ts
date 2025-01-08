import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function GET(){

    // Set options for request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } as HeadersInit
    }

    // Retrieve top ERC20 tokens by market cap
    const data = await fetch('https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-tokens', options);

    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}