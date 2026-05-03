import { NextResponse } from "next/server";

const ENS_CONTRACT = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2/';

const options = {
    method: 'GET',
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY ?? ''
    } as HeadersInit
};

function inferCategory(fromAddress: string): string {
    if (!fromAddress || fromAddress === '0x0000000000000000000000000000000000000000') return 'mint';
    return 'transfer';
}

// Custom Route Handler function
export async function POST(request: Request) {
    const body = await request.json();

    const response = await fetch(
        MORALIS_URL + 'nft/' + ENS_CONTRACT + '/' + encodeURIComponent(body.id) + '/transfers?chain=eth&format=decimal',
        options
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json({ error: 'Moralis NFT transfers error', status: response.status, detail: errorBody }, { status: response.status });
    }

    const data = await response.json();

    // Map Moralis response fields to the shape the frontend expects
    const results = (data.result ?? []).map((t: any) => ({
        timestamp: t.block_timestamp,
        category: inferCategory(t.from_address),
        from: t.from_address ?? null,
        to: t.to_address ?? null
    }));

    return NextResponse.json({ results });
}
