import { NextResponse } from "next/server";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { contractBody } from "@/lib/validation";

// ERC20 token information by contract address (CoinGecko Demo API)
export const POST = withErrorHandling(async (request: Request) => {
    const { contract } = await parseBody(request, contractBody);
    const information = await coingecko('/coins/ethereum/contract/' + contract.toLowerCase(), CG_CACHE.lookup);
    return NextResponse.json({ information });
});
