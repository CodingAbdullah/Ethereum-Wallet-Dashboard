import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getMev } from "@/lib/mev";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// MEV-Boost relays, builders and proposer payments (public relay data API, cached 5 minutes)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getMev(), { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } });
});
