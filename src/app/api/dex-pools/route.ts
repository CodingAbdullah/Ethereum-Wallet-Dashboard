import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getDexPools, GECKO_NETWORKS } from "@/lib/dexPools";

export const dynamic = 'force-dynamic';

// GET ?chain=eth: trending and new DEX pools on one network (GeckoTerminal, cached 2-5 minutes)
export const GET = withErrorHandling(async (request: Request) => {
    const chain = new URL(request.url).searchParams.get('chain') ?? 'eth';
    return NextResponse.json(await getDexPools(chain in GECKO_NETWORKS ? chain : 'eth'), { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } });
});
