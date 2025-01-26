import { NextResponse } from "next/server";

// Opensea URL endpoint
const OPENSEA_URL = 'https://api.opensea.io/api/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json();
    const { address, id, network } = body;

    // If the holesky testnet is requested, return response with no information
    if (network === 'holesky') {
        return NextResponse.json({
            information: []
        });
    }
    else {
        // Setting options to make authenticated API calls to retrieve ERC721 Opensea token information
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'accept' : 'application/json',
                'X-API-KEY' : process.env.OPENSEA_API_KEY
            } as HeadersInit
        };

        // Making request to Opensea API to retrieve ERC721 Opensea token information
        const response = await fetch(OPENSEA_URL + 'chain/' + (network === 'eth' ? 'ethereum' : network) +  "/contract/" + address + '/nfts/' + id, options);
        
        // Conditionally returning data based on fetch request
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
}