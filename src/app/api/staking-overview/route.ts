import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getStakingOverview } from "@/lib/stakingOverview";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Staking ratio, base reward rate, and liquid staking / restaking protocols (Beacon API, CoinGecko, DefiLlama)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getStakingOverview(), { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' } });
});
