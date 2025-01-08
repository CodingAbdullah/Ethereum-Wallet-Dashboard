import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function POST(request: Request) {
    const body = await request.json();

    // Set the parameters
    const params = {
        "chain_id": "ethereum",
        "owner_address": body.address,
    }
    
    // Set options for request
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_2
        } as HeadersInit
    }

    // Fetch data using options and FETCH API
    const data = await fetch("https://api.transpose.io/ens/ens-records-by-owner?" + new URLSearchParams(params), options)

    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}