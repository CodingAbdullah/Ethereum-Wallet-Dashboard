import { NextResponse } from "next/server";
import dayjs from "dayjs";

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Custom Route Handler function
export async function POST(request: Request){
    const body = await request.json(); // Retrieve information from request
    const { address, interval } = body;

    const modifiedInterval = interval === '14' ? 15 : interval;

    // Set options parameter
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        } as HeadersInit
    };

    // Run backend request to fetch ERC721 Collection Chart data
    const response = await fetch(PRO_COINGECKO_URL + '/nfts/ethereum/contract/' + address + '/market_chart?days=' + modifiedInterval, options);

    // Conditionally return response based on data fetch
    if (response.ok) {
        const information = await response.json();
    
        // Get hold of floor price, market cap, and volume data of the collection
        // Modify each part of the data by including time and value
        const floor_price: [[number, number]] = information.floor_price_usd;
        const market_cap: [[number, number]] = information.market_cap_usd;
        const volume: [[number, number]] = information['h24_volume_usd'];

        return NextResponse.json({
            floorPrices: floor_price.map(floorPriceValue => ({ 
                date: dayjs(floorPriceValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(floorPriceValue[1])) 
            })),
            marketCaps: market_cap.map(marketCapValue => ({ 
                date: dayjs(marketCapValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(marketCapValue[1])) 
            })),
            volumes: volume.map(volumeValue => ({ 
                date: dayjs(volumeValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(volumeValue[1])) 
            }))
        });
    }
    else {
        return NextResponse.json({
            message: "Could not fetch ERC721 collection chart data"
        }, { status: 400 });
    }
}