import { NextResponse } from "next/server";

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data based on request
    
    // Return data based on data fetch
    const response = await fetch('https://eth-mainnet.g.alchemy.com/nft/v3/' + process.env.ALCHEMY_API_KEY_2 + '/getFloorPrice?contractAddress=' + body.address);

    // Conditionally return data
    if (response.status === 200) {
        const data = await response.json();
        return NextResponse.json({ information: data });
    }
    else {
        return NextResponse.json({ message: "Could not fetch collection floor prices by marketplace" }, {status: 500 });
    }
}