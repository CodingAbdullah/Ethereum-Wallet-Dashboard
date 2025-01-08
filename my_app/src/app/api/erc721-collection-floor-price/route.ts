import { NextResponse } from "next/server";
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs

// Alchemy endpoint
const ALCHEMY_URL = 'https://eth-mainnet.g.alchemy.com/nft/v2';

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve data based on request
    
    // Run backend request
    sdk.server(ALCHEMY_URL);

    // Return data based on data fetch
    sdk.getFloorPrice({ apiKey: process.env.ALCHEMY_API_KEY_1 , contractAddress: body.address })
    .then((response: Response) => 
        NextResponse.json({ information: response })
    )
    .catch(() => {
        NextResponse.json({});
    });
}