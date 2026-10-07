import { NextResponse } from "next/server";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Global DeFi market data (CoinGecko Demo API)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await coingecko('/global/decentralized_finance_defi', CG_CACHE.global));
});
