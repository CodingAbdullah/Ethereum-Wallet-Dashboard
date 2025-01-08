import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function POST(request: Request) {
    // JSON format the body
    const body = await request.json();

    // Set parameters for request
    const params = {
        chain_id : 'ethereum',
        ens_name: body.address
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
    const data = await fetch('https://api.transpose.io/ens/ens-transfers-by-name?' + new URLSearchParams(params), options);

    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}