import { NextResponse } from "next/server";

// MORALIS_URL API endpoint
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json()

    // Trades endpoint
    const TRADES_ENDPOINT = '/trades';

    // Setting options parameter
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    };

    // Run backend request
    const data = await fetch(MORALIS_URL + 'nft/' + body.address + TRADES_ENDPOINT, options)
 
    // Conditionally return data based on fetch request
    if (!data.ok) {
        NextResponse.json({
            message: "Could not fetch ERC721 collection sales data"
        }, { status: 400 });
    }
    else {
        const information = await data.json(); 

        NextResponse.json({
            information
        });
    }
}