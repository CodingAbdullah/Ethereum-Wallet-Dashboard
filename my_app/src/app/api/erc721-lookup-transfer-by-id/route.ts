import { NextResponse } from "next/server";

// MORALIS_URL endpoint
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request
    const { address, id, network } = body;

    // Lookup endpoint
    const LOOKUP_ENDPOINT = '/transfers';

    // Setting options parameter for request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } as HeadersInit
    }

    // Making request to Moralis API for finding ERC721 token transfer information
    const response = await fetch(MORALIS_URL + 'nft/' + address + "/" + id + LOOKUP_ENDPOINT + "?chain=" + network + "&format=decimal", options)
    
    // Conditionally return data based on request status
    if (response.ok) {
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
    else {
        return NextResponse.json({}, { status: 400 });
    }
}