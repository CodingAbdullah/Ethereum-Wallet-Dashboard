import { NextResponse } from "next/server";
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    
    // JSON format the body
    const body = await request.json();

    // Set options to be used in request
    const options = {   
        method: 'GET', 
        headers: { 
            'content-type' : 'application/json', 
            'access-control-allow-origin': '*',
            'X-API-KEY' : process.env.MORALIS_API_KEY ?? '' // Transpose API key hidden 
        } as HeadersInit
    }
    
    // Fetch data using data
    const response = await fetch(MORALIS_URL + 'resolve/' + body.address + "/reverse", options)
   
    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}
