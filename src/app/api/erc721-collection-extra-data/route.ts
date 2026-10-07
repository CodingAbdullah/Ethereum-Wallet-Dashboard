import { NextResponse } from "next/server";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// NFT collection market data by contract address (CoinGecko Demo API)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const information = await coingecko('/nfts/ethereum/contract/' + address.toLowerCase(), CG_CACHE.lookup);
    return NextResponse.json({ information });
});
