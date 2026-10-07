import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getDerivatives } from "@/lib/derivatives";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ETH funding rates, open interest and options (Deribit, OKX, Bybit public APIs, cached 5-10 minutes)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getDerivatives(), { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } });
});
