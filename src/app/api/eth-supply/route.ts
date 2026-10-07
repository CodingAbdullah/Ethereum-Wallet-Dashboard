import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getEthSupply } from "@/lib/ethSupply";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ETH burnt vs issued over the last ~24 hours (free RPC + Beacon API, cached 10 minutes)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getEthSupply(), { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } });
});
