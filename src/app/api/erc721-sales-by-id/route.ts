import { NextResponse } from "next/server";
import { z } from "zod";
import { formatEther } from "viem";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressSchema, tokenIdSchema } from "@/lib/validation";

const bodySchema = z.object({ address: addressSchema, id: tokenIdSchema });

const MARKETPLACE_NAMES: Record<string, string> = {
    '0x00000000006c3852cbef3e08e8df289169ede581': 'OpenSea (Seaport 1.1)',
    '0x0000000000000068f116a894984e2db1123eb395': 'OpenSea (Seaport 1.5)',
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': 'OpenSea (Seaport 1.6)',
    '0x59728544b08ab483533076417fbbb2fd0b17ce3a': 'LooksRare',
    '0x0000000000e655fae4d56241588680f86e3b2377': 'Blur',
    '0x74312363e45dcaba76c59ec49a13aa114034ea7': 'X2Y2'
};

interface MoralisTrade {
    block_timestamp: string;
    marketplace_address?: string;
    price?: string;
    buyer_address?: string;
    seller_address?: string;
}

// Sales history of a single NFT (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id } = await parseBody(request, bodySchema);
    const data = await moralis<{ result?: MoralisTrade[] }>('/nft/' + address + '/' + id + '/trades?chain=eth', 300);

    const results = (data.result ?? []).map(trade => ({
        timestamp: trade.block_timestamp,
        exchange_name: MARKETPLACE_NAMES[(trade.marketplace_address ?? '').toLowerCase()] ?? trade.marketplace_address ?? 'Unknown',
        contract_version: '',
        eth_price: trade.price ? Number(formatEther(BigInt(trade.price))) : 0,
        usd_price: 'N/A',
        buyer: trade.buyer_address ?? null,
        seller: trade.seller_address ?? null
    }));

    return NextResponse.json({ information: { results } });
});
