import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function GET(){
   // Setting options to fetch top collections
   const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'X-API-Key' : process.env.MORALIS_API_KEY_2
        } as HeadersInit
    }

    // Fetch data using the FETCH api
    const data = await fetch("https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections", options)
    
    // Conditionally return data based on data fetch
    if (data.ok) {
        const information = await data.json();
        NextResponse.json({
            topCollections: information
        })
    }
    else {
        NextResponse.json({});
    }
}