import { NextResponse } from "next/server";

// Opensea URL endpoint
const OPENSEA_URL = 'https://api.opensea.io/api/v2/';

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json();
    const { address, id, network } = body;

    // If the holesky testnet is requested, return response with no information
    if (network === 'holesky') {
        NextResponse.json({
            information: []
        });
    }
    else {
        // Setting options to make authenticated API calls to retrieve ERC721 token information
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'accept' : 'application/json',
                'X-API-KEY' : process.env.OPENSEA_API_KEY
            } as HeadersInit
        };

        // Making request to Opensea API to retrieve ERC721 token information
        const data = await fetch(OPENSEA_URL + 'chain/' + (network === 'eth' ? 'ethereum' : network) +  "/contract/" + address + '/nfts/' + id, options);
        
        // Conditionally returning data based on fetch request
        if (data.ok) {
            const information = await data.json();
            NextResponse.json({
                information: [information]
            });
        }
        else {
            NextResponse.json({}, { status: 400 });
        }
    }
}