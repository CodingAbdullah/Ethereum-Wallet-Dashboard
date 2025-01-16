import { NextResponse } from "next/server";
import dayjs from "dayjs";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    const { address, interval } = body;

    let modifiedInterval = interval === '14' ? 15 : interval;

    // Set options parameter
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        } as HeadersInit
    };

    // Run backend request to fetch ERC721 Collection Chart data
    const response = await fetch(PRO_COINGECKO_URL + 'nfts/ethereum/contract/' + address + '/market_chart?days=' + modifiedInterval, options);

    // Conditionally return response based on data fetch
    if (response.ok) {
        const information = await response.json();
    
        // Get hold of floor price, market cap, and volume data of the collection
        // Modify each part of the data by including time and value
        const floor_price: [string, string] = information.floor_price_usd;
        const market_cap: [string, string] = information.market_cap_usd;
        const volume: [string, string] = information['h24_volume_usd'];

        NextResponse.json({
            floorPrices: floor_price.map(floorPriceValue => ({ 
                time: dayjs(floorPriceValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(floorPriceValue[1])) 
            })),
            marketCaps: market_cap.map(marketCapValue => ({ 
                time: dayjs(marketCapValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(marketCapValue[1])) 
            })),
            volumes: volume.map(volumeValue => ({ 
                time: dayjs(volumeValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(volumeValue[1])) 
            }))
        });
    }
    else {
        NextResponse.json({
            message: "Could not fetch ERC721 collection chart data"
        }, { status: 400 });
    }
}