import { NextResponse } from "next/server";

const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const { address, id, network } = await request.json();

    // Setting options for request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } as HeadersInit
    }

    // Making request to Moralis API for finding ERC721 token information
    const response = await fetch(MORALIS_URL + 'nft/' + address + "/" + id + "?chain=" + network + "&format=decimal", options)
    
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