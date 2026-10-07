import { NextResponse } from "next/server";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Global crypto market data (CoinGecko Demo API)
export const GET = withErrorHandling(async () => {
    const information = await coingecko('/global', CG_CACHE.global);
    return NextResponse.json({ information });
});
