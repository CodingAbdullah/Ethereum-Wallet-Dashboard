import { NextResponse } from "next/server";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export default async function GET(){
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // Trending coins in the market
    let trendingCoinData = "";
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3 // API-KEY for authenticated call
        } as HeadersInit
    }

    const data = await fetch(PRO_COINGECKO_URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins
    
    // Conditionally return data based on data fetch
    if (data.ok) {
        const trendingCoins = await data.json();

        // Format display data and return back to client
        let information = '';
        for (var i = 0; i < trendingCoins.coins.length - 2; i++){ 
            information += trendingCoins.coins[i].item.name;
            information += ' - ';
            information += trendingCoins.coins[i].item.symbol;
            trendingCoinData += information;
            information = ' | ';
        }

        // Return trending coins data
        NextResponse.json({
            trendingCoinData: trendingCoins
        });
    }
    else {
        // Return error message
        NextResponse.json({
            message: "Could not fetch trending coins data"
        }, { status: 400 });
    }
}