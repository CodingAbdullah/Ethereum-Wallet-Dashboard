import { NextResponse } from "next/server";

// MORALIS_URL API endpoint
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export default async function POST(request: Request){
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
    const data = await fetch(MORALIS_URL + 'nft/' + body.address + TRANSFERS_ENDPOINT, options)

    // Conditionally render data based on request result
    if (data.ok) {
        const information = await data.json();

        // Return response containing data
        NextResponse.json({
            information
        });
    }
    else {
        NextResponse.json({
            message: "Could not retrieve ERC721 collection transfers data"
        }, { status: 400 });
    }
}