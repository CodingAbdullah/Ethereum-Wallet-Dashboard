import { NextResponse } from 'next/server';

const mod = "account";
const action = "balance";
const tag = "latest";
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
const ETHERSCAN_ETH_URL = 'https://api.etherscan.io/api';

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve data from request

    // Setting options for response
    const options = {
        method: 'GET',
        headers : {
            'content-type' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_PRICES_API_KEY
        } as HeadersInit
    }

    // Fetch data based on request
    const ethBalanceResponse = await fetch(ETHERSCAN_ETH_URL + "?module=" + mod + "&action=" + action + "&address=" + body.address + "&tag=" + tag + "&apikey=" + API_KEY);
    const ethPriceResponse = await fetch('https://pro-api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', options);
    
    // Fetch data and conditionally return data based on request response
    if (!ethBalanceResponse.ok || !ethPriceResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch Ethereum price' }, { status: 500 });
    }
    else {
        const ethBalanceData = await ethBalanceResponse.json();
        const ethPriceData = await ethPriceResponse.json();

        // Modify and return data for table display
        return NextResponse.json({ 
            ethPrice: "$" + Number(ethPriceData.ethereum.usd).toFixed(2), 
            ethBalance: Number(ethBalanceData.result)/1e18 + ' ETH', 
            usdValue: "$" + ((Number(ethBalanceData.result)/1e18)*(ethPriceData.ethereum.usd)) 
        });
    }
}