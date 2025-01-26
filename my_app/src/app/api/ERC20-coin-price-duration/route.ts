import { NextResponse } from "next/server";
import dayjs from "dayjs";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    const { contract, interval } = body;

    // Request ERC20 token prices
    let ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + contract;

    if (interval === '24') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=2';
    }
    else if (interval === '7') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=7&interval=daily';
    }
    else if (interval === '14') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=14&interval=daily';
    }
    else {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=30&interval=daily';
    }

    // Setting options for authenticated API call
    const options = {
        method: "GET",
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        } as HeadersInit
    };

    // Safely fetching data using axios, escaping with try-catch block
    const response = await fetch(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval

    if (!response.ok) {
        return NextResponse.json({
            message: "Could not fetch ERC20 price duration data"
        }, { status: 400 });
    }
    else {
        // Conditionally send the response and format it conforming to the interval
        // Incorporate the dayjs library for easy date formatting
        const information = await response.json();
        const prices: [[number, number]] = information.prices;

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