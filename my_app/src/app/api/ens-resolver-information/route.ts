import { NextResponse } from "next/server";

// Custom Route Handler function
export async function POST(request: Request) {
    const body = await request.json();

    // Set the parameters
    const params = {
        "chain_id": "ethereum",
        "resolved_address": body.address,
    }
    
    // Set options for request
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_3
        } as HeadersInit
    }

    // Fetch data using options and FETCH API
    const response = await fetch('https://api.transpose.io/ens/ens-records-by-resolved-account?' + new URLSearchParams(params), options)

    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}