import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } as HeadersInit
    }

    // Fetch data based on request parameters
    const data = await fetch('https://deep-index.moralis.io/api/v2.2/' + body.address + '/nft/collections?chain=' + body.network, options) // Pass in address and chain values
    
    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}