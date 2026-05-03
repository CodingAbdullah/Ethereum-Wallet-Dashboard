import { NextResponse } from "next/server";

const mod = "account";
const startBlock = 0;
const endBlock = 999999999;
const page = 1;
const sort = 'desc';
const API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_ETH_URL = 'https://api.etherscan.io/v2/api?chainid=1';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Fetch data based on request

    // Gather data about internal transactions (L2.. bridges, etc)
    const response = await fetch(ETHERSCAN_ETH_URL + '&module=' + mod + '&action=txlistinternal&address=' + body.address + '&startblock=' + startBlock
    + '&endblock=' + endBlock + '&page=' + page + '&offset=' + 1000 + '&sort=' + sort + '&apikey=' + API_KEY)
        
    if (!response.ok)
        return NextResponse.json({ error: 'Failed to fetch internal transactions' }, { status: 500 });

    const data = await response.json();

    // Etherscan returns result as a string (e.g. "No transactions found") when status is "0"
    if (!Array.isArray(data.result))
        return NextResponse.json({ result: [] });

    return NextResponse.json(data);
}