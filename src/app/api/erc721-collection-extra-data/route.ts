import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    
    // Setting options parameter for request
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        } as HeadersInit
    };

    // Run backend request
    const response = await fetch(PRO_COINGECKO_URL + '/nfts/ethereum/contract/' + body.address, options);

    // Conditionally return data
    if (!response.ok) {
        return NextResponse.json({
            message: "Could not retrieve ERC721 collection data"
        }, { status: 400 });
    }
    else {
        const information = await response.json();
        return NextResponse.json({
            information
        });
    }
}
