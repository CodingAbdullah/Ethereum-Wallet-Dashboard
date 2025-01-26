import { NextResponse } from "next/server";

// Custom Route Handler function
export async function POST(request: Request) { 
    const body = await request.json(); // Format body from request body
    
    // Set params to be used in request function
    const params = {
        "chain_id": "ethereum",
        "ens_names": body.ensName
    }
    
    // Setting options for request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1 ?? ''
        } as HeadersInit
    } 

    // Fetch data using the FETCH API
    const response = await fetch("https://api.transpose.io/ens/ens-records-by-name?" + new URLSearchParams(params), options)
    
    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}