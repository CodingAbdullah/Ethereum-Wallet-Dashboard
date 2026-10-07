import { NextResponse } from "next/server";
import { getTopMarkets } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Top 250 coins by market cap (CoinGecko Demo API, shared cached query)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getTopMarkets());
});
