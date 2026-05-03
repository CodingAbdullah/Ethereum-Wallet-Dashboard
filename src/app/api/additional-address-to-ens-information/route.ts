import { NextResponse } from "next/server";

const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2/';

const options = {
    method: 'GET',
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY ?? ''
    } as HeadersInit
};

// Custom Route Handler function
export async function POST(request: Request) {
    const body = await request.json();

    const response = await fetch(MORALIS_URL + 'resolve/ens/' + encodeURIComponent(body.ensName), options);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json({ error: 'Moralis ENS resolve error', status: response.status, detail: errorBody }, { status: response.status });
    }

    const data = await response.json();

    // Moralis returns { address } — map to the shape the frontend expects: { results: [{ owner }] }
    return NextResponse.json({ results: [{ owner: data.address }] });
}
