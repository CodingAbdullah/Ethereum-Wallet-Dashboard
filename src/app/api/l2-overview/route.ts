import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getL2Overview } from "@/lib/l2";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Layer 2 comparison for /l2 (DefiLlama TVL + L2BEAT type and stage, cached 30-60 min)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getL2Overview(), { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' } });
});
