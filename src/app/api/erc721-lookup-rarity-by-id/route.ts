import { NextResponse } from "next/server";

// ALCHEMY URL endpoint
const ALCHEMY_URL = 'https://eth-mainnet.g.alchemy.com/nft/v2';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request
    const { address, id, network } = body;

    if (network !== 'eth') {
        // Throw an alert on this message
        return NextResponse.json({
            information: { data: null } 
        });
    }
    else {
        // Set options parameter for request
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            } as HeadersInit
        };

        // Making request to Alchemy API for finding ERC721 token rarity
        const response = await fetch(ALCHEMY_URL + '/' + process.env.ALCHEMY_API_KEY_1 + "/computeRarity?contractAddress=" + address + "&tokenId=" + id, options)
        
        // Conditionally return data based on request status
        if (response.ok) {
            const information = await response.json();
            return NextResponse.json({
                information : { data: information }
            });
        }
        else {
            return NextResponse.json({}, { status: 400 });
        } 
    }
}