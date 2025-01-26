import { NextResponse } from "next/server";

const mod = "account";
const startBlock = 0;
const endBlock = 99999999;
const page = 1;
const sort = 'desc';
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
const ETHERSCAN_ETH_URL = 'https://api.etherscan.io/api';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    // Gather list of transactions in descending order
    const response = await fetch(ETHERSCAN_ETH_URL + '?module=' + mod + "&action=txlist&address=" + body.address + "&startblock=" + startBlock 
    + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + API_KEY);

    // Fetch data using the Ethereum data endpoints
    if (!response.ok) 
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    else {
        const data = await response.json();
        return NextResponse.json(data);
    }
}