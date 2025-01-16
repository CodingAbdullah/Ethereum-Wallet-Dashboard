import { NextResponse } from "next/server";
import dayjs from 'dayjs';

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
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
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    }

    // Fetch data based on request parameters
    const response = await fetch(PRO_COINGECKO_URL + COIN_PRICE_ENDPOINT, options);

    if (!response.ok) {
        return NextResponse.json({
            message: "Could not fetch coin price duration data"
        });
    }
    else {
        const information = await response.json();
        const prices: [[number, number]] = information.prices;
        
        // Conditionally send the response and format it conforming to the interval
        // Incorporate the dayjs library for easy date formatting
        if (interval === '24'){
            return NextResponse.json({
                coinPrices: prices.map(price => ({ 
                    date: dayjs(price[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[1], 
                    price: Number(Number(price[1])) 
                })).splice(24) 
            });
        }
        else {
            return NextResponse.json({
                coinPrices: prices.map(price => ({ 
                    date: dayjs(price[0]).format('YYYY-MM-DD'), 
                    price: Number(Number(price[1])) 
                }))
            });
        }
    }
}