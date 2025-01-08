import { NextResponse } from "next/server";
import { NETWORK_MAPPER } from "@/app/utils/constants/NETWORK_MAPPER";

// Set MORALIS URL for request
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/';
const mod = "account";
const action = "balance";
const tag = "latest";

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request

    if (body.network === 'eth' || body.network === 'sepolia' || body.network.split('-')[0] === 'polygon'){
        
        // Ensure network belongs to as one of the keys in the NETWORK_MAPPER constant
        const network: keyof typeof NETWORK_MAPPER = body.network; // Type assertion for network
        
        // Gather wallet analytics using API resources and running checks to see if wallet address is valid
        const data = await fetch(NETWORK_MAPPER[network] + "?module=" + mod + "&action=" + action + "&address=" + body.address + "&tag=" + tag + "&apikey=" + 
        ((body.network === 'polygon' || body.network === 'polygon-mumbai') ? process.env.POLYGON_API_KEY : process.env.ETHERSCAN_API_KEY))
            
        // Fetch data using the Ethereum data endpoints
        if (!data.ok) 
            return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
        else {
            return NextResponse.json(data);
        }
    }
    else {
        // Setting options for the request
        const options = {
            method: 'GET',
            headers: {
                'content-type' : 'application/json',
                'X-API-KEY' : process.env.MORALIS_API_KEY
            } as HeadersInit
        }
        
        // Transactions endpoint for retrieving information related to an wallet's activity on an ETH testnet
        const data = await fetch(MORALIS_URL + body.address + '/balance?chain=' + body.network, options)
        
        // Fetch data using the Ethereum data endpoints
        if (!data.ok) 
            return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
        else {
            return NextResponse.json(data);
        }
    }
}