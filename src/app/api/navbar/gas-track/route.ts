import { NextResponse } from "next/server";

// Request URL
const BLOCKNATIVE_URL = 'https://api.blocknative.com/gasprices/blockprices';

// Async function for working with Ethereum Gas
async function fetchEthereumGas() {
    
    // Add blocknative credentials
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization': process.env.BLK_API_KEY ?? ''
        } as HeadersInit
    }
    
    const response = await fetch(BLOCKNATIVE_URL, options);

    // Fetch Gas using Ethereum endpoints
    if (!response.ok) 
        throw new Error('Failed to fetch Ethereum price');
    
    return response.json();
}

// Main route function for handling request
export async function GET() {
    try {
        const data = await fetchEthereumGas();
        return NextResponse.json(data);
    } 
    catch {
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    }
}