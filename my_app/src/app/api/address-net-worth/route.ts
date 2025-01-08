import { NextResponse } from "next/server";

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request

    // Conditionally handle request
    if (body.network !== 'eth') {
        NextResponse.json({
            information: { result: [] }
        });
    }
    else {
        // Set options for request
        const options = {
            method: 'GET',
            headers: {
                'content-type' : 'application/json',
                'X-API-KEY' : process.env.MORALIS_API_KEY_2
            } as HeadersInit
        };

        // Retrieving information related to a wallet's net worth on ETH mainnet
        const data = await fetch("https://deep-index.moralis.io/api/v2.2/wallets/" + body.address + "/net-worth?chains%5B0%5D=eth&exclude_spam=true&exclude_unverified_contracts=true", options);
        
        // Fetch data using the Ethereum data endpoints
        if (!data.ok) 
            return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
        else {
            return NextResponse.json(data);
        }
    }
}