import { NextResponse } from 'next/server';

const mod = "account";
const action = "balance";
const tag = "latest";
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
const ETHERSCAN_ETH_URL = 'https://api.etherscan.io/api';

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    // Fetch data based on request
    const data = await fetch(ETHERSCAN_ETH_URL + "?module=" + mod + "&action=" + action + "&address=" + body.address + "&tag=" + tag + "&apikey=" + API_KEY)

    // Fetch data using the Ethereum data endpoints
    if (!data.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        return NextResponse.json(data);
    }
}