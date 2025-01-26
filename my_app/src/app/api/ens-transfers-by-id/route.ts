import { NextResponse } from "next/server";

// Custom Route Handler function
export async function POST(request: Request) {
    // JSON format the body
    const body = await request.json();

    // Set parameters for request
    const params = {
        chain_id : 'ethereum',
        token_id: body.id
    }

    // Set options for request
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } as HeadersInit
    }

    // Fetch data based on options
    const response = await fetch('https://api.transpose.io/ens/ens-transfers-by-token-id?' + new URLSearchParams(params), options)

    // Fetch data using the Ethereum data endpoints
    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    }
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}