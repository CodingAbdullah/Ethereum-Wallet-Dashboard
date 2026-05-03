import { NextResponse } from "next/server";

const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2/';

const MARKETPLACE_NAMES: Record<string, string> = {
    '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea (Seaport 1.1)',
    '0x0000000000000068f116a894984e2db1123eb395': 'OpenSea (Seaport 1.5)',
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': 'OpenSea (Seaport 1.6)',
    '0x59728544b08ab483533076417fbbb2fd0b17ce3a': 'LooksRare',
    '0x0000000000e655fae4d56241588680f86e3b2377': 'Blur',
    '0x74312363e45dcaba76c59ec49a13aa114034ea7': 'X2Y2'
};

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
    const { address, id } = body;

    const response = await fetch(
        MORALIS_URL + 'nft/' + address + '/' + encodeURIComponent(id) + '/trades?chain=eth',
        options
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json({ error: 'Moralis NFT trades error', status: response.status, detail: errorBody }, { status: response.status });
    }

    const data = await response.json();

    // Map Moralis response to the shape the frontend expects
    const results = (data.result ?? []).map((trade: any) => {
        const marketplaceAddr = (trade.marketplace_address ?? '').toLowerCase();
        const exchange_name = MARKETPLACE_NAMES[marketplaceAddr] ?? trade.marketplace_address ?? 'Unknown';
        const ethPrice = trade.price ? Number(BigInt(trade.price)) / 1e18 : 0;

        return {
            timestamp: trade.block_timestamp,
            exchange_name,
            contract_version: '',
            eth_price: ethPrice,
            usd_price: 'N/A',
            buyer: trade.buyer_address ?? null,
            seller: trade.seller_address ?? null
        };
    });

    return NextResponse.json({ information: { results } });
}
