import { NextResponse } from "next/server";
import { getTrending } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Trending coins and NFT collections (CoinGecko Demo API)
export const GET = withErrorHandling(async () => {
    return NextResponse.json({ trendingCoinData: await getTrending() });
});
