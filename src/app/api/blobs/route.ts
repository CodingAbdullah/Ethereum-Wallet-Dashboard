import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getBlobs } from "@/lib/blobs";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Blob usage, fees and recent posters (free RPC, cached 10 minutes)
export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getBlobs(), { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } });
});
