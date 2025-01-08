import { NextResponse } from "next/server";
import dayjs from 'dayjs';

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export default async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    const { coin, interval } = body;

    // Request coin prices
    let COIN_PRICE_ENDPOINT = '/coins/' + coin;

    if (interval === '24') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=2';
    }
    else if (interval === '7') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=7&interval=daily';
    }
    else if (interval === '14') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=14&interval=daily';
    }
    else {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=30&interval=daily';
    }

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    }

    // Fetch data based on request parameters
    const data = await fetch(PRO_COINGECKO_URL + COIN_PRICE_ENDPOINT, options);

    if (!data.ok) {
        NextResponse.json({
            message: "Could not fetch coin price duration data"
        });
    }
    else {
        const information = await data.json();
        const prices: [string, string] = information;
        
        // Conditionally send the response and format it conforming to the interval
        // Incorporate the dayjs library for easy date formatting
        if (interval === '24'){
            NextResponse.json({
                coinPrices: prices.map(price => ({ 
                    time: dayjs(price[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[1], 
                    price: Number(Number(price[1])) 
                })).splice(24) 
            });
        }
        else {
            NextResponse.json({
                coinPrices: prices.map(price => ({ 
                    time: dayjs(price[0]).format('YYYY-MM-DD'), 
                    price: Number(Number(price[1])) 
                }))
            });
        }
    }
}