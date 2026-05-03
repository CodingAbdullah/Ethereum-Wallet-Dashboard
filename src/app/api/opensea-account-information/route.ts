import { NextResponse } from "next/server";

// Opensea URL for processing request
const OPENSEA_URL = 'https://api.opensea.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    
    // Parse request body
    const body = await request.json();

    // Set options for making authenticated API calls
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'X-API-KEY': process.env.OPENSEA_API_KEY
        } as HeadersInit
    }
    
    // Gather data about Opensea account
    const response = await fetch(OPENSEA_URL + 'accounts/' + body.address, options);
    
    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json(
            { error: 'OpenSea API error', status: response.status, detail: errorBody },
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json(data);
}