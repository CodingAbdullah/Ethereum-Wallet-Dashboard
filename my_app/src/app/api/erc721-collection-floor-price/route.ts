import { NextResponse } from "next/server";
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs

// Alchemy endpoint
const ALCHEMY_URL = 'https://eth-mainnet.g.alchemy.com/nft/v2/';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data based on request
    
    // Run backend request
    sdk.server(ALCHEMY_URL);

    // Return data based on data fetch
    const response = await sdk.getFloorPrice({ apiKey: process.env.ALCHEMY_API_KEY_1 , contractAddress: body.address });

    // Conditionally return data
    if (response.status === 200) {
        return NextResponse.json({ information: response });
    }
    else {
        return NextResponse.json({ message: "Could not fetch collection floor prices by marketplace" }, {status: 500 });
    }
}