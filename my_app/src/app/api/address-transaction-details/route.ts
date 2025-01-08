import { NextResponse } from "next/server";
import { NETWORK_MAPPER } from "@/app/utils/constants/NETWORK_MAPPER";

// Set MORALIS URL for request
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';
const mod = "account";
const action = "balance";
const tag = "latest";
const startBlock = 0;
const endBlock = 99999999;
const page = 1;
const sort = 'desc';

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json();

    if (body.network === 'eth' || body.network === 'sepolia'){
        // Ensure network belongs to as one of the keys in the NETWORK_MAPPER constant
        const network: keyof typeof NETWORK_MAPPER = body.network; // Type assertion for network
        
        // Transactions of a particular account, if the address of the particular one entered is valid
        const data = await fetch(NETWORK_MAPPER[network] + '?module=' + mod + "&action=txlist&address=" + body.address + "&startblock=" + startBlock 
        + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + process.env.ETHERSCAN_API_KEY)
        
        // Fetch data using the Ethereum data endpoints
        if (!data.ok) 
            return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
        else {
            return NextResponse.json(data);
        }
    }
    else {
        // Set options for request
        const options = {
            method: 'GET',
            headers: {
                'content-type' : 'application/json',
                'X-API-KEY' : process.env.MORALIS_API_KEY
            } as HeadersInit
        }
        
        // Transactions endpoint for retrieving information related to a wallet's activity, on an ETH testnet
        const data = await fetch(MORALIS_URL + body.address + '?chain=' + body.network, options);

        // Fetch data using the Ethereum data endpoints
        if (!data.ok) 
            return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
        else {
            return NextResponse.json(data);
        }
    }
}