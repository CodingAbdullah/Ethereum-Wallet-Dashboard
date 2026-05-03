import { NextResponse } from "next/server";

const COINGECKO_URL = 'https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';

// Custom Route Handler function
export async function GET(){

    const options = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_GENERIC_API_KEY
        } as HeadersInit
    }

    const response = await fetch(COINGECKO_URL, options);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json({ error: 'CoinGecko error', status: response.status, detail: errorBody }, { status: response.status });
    }

    const raw = await response.json();

    // Map CoinGecko response to the shape the frontend expects
    const data = raw.map((token: any) => ({
        token_name: token.name ?? '',
        token_symbol: token.symbol ?? '',
        token_logo: token.image ?? '',
        price_usd: String(token.current_price ?? 0),
        market_cap_usd: String(token.market_cap ?? 0),
        price_24h_percent_change: String(token.price_change_percentage_24h ?? 0)
    }));

    return NextResponse.json(data);
}
