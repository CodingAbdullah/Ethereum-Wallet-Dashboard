import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getGovernance } from "@/lib/governance";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Active and recent Snapshot proposals for major protocols (cached 15 minutes)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getGovernance(), { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } });
});
