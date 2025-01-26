import { NextResponse } from "next/server";

// MORALIS_URL API endpoint
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request

    // Set options parameter
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-api-key' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    };

    // Run backend request using the FETCH api
    const response = await fetch(MORALIS_URL + 'nft/' + body.address, options);

    // Return data based on data fetch request
    if (response.ok) {
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
    else {
        return NextResponse.json({
            message: "Could not retrieve ERC721 collection data"
        }, { status: 400 });
    }
}
