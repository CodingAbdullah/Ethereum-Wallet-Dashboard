import { NextResponse } from "next/server";

// Custom Route Handler function
export async function GET(){
   // Setting options to fetch top collections
   const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'X-API-Key' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    }

    // Fetch data using the FETCH api
    const response = await fetch("https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections", options)
    
    // Conditionally return data based on data fetch
    if (response.ok) {
        const information = await response.json();
        return NextResponse.json({
            topCollections: information
        })
    }
    else {
        return NextResponse.json({}, { status: 400 });
    }
}