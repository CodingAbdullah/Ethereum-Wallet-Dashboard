import { NextResponse } from "next/server";

const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs

// Alchemy endpoint
const ALCHEMY_URL = 'https://eth-mainnet.g.alchemy.com/nft/v2';

// Custom Route Handler function
export async function POST(request: Request) {
    const body = await request.json();

    // Run backend request
    sdk.server(ALCHEMY_URL);
    
    // Retrieve data and return response based on status
    sdk.summarizeNFTAttributes({ contractAddress: body.address, apiKey: process.env.ALCHEMY_API_KEY_2 })
    .then((response: Response) => { 
        NextResponse.json({ information: response })
    })
    .catch(() => {
        NextResponse.json({});
    });
}