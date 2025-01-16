import { NextResponse } from "next/server";

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request
    const { address, id } = body;

    // Set params
    const params = {
        "chain_id": "ethereum",
        "contract_address": address,
        "token_id": id
    }

    // Set options parameter for request
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } as HeadersInit
    }

    // Making request to Transpose API for finding ERC721 token sales information
    const response = await fetch("https://api.transpose.io/nft/sales-by-token-id?" + new URLSearchParams(params), options)
    
    // Conditionally return data based on request status
    if (response.ok) {
        const information = await response.json();
        NextResponse.json({
            information
        });
    }
    else {
        NextResponse.json({}, { status: 400 });
    }
}