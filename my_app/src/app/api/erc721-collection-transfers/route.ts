import { NextResponse } from "next/server";

// MORALIS_URL API endpoint
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    const TRANSFERS_ENDPOINT = '/transfers'; // Transfers endpoint

    // Set options parameter
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    };

    // Run backend request
    const response = await fetch(MORALIS_URL + 'nft/' + body.address + TRANSFERS_ENDPOINT, options)

    // Conditionally render data based on request result
    if (response.ok) {
        const information = await response.json();

        // Return response containing data
        return NextResponse.json({
            information
        });
    }
    else {
        return NextResponse.json({
            message: "Could not retrieve ERC721 collection transfers data"
        }, { status: 400 });
    }
}