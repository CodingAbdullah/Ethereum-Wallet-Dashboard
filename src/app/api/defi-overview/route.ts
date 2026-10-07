import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getDefiOverview } from "@/lib/defi";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// DeFi overview for /defi (DefiLlama open API, each section cached 30-60 min)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getDefiOverview(), { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' } });
});
