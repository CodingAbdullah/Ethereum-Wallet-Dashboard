import { NextResponse } from "next/server";
import { getRocketPoolStats } from "@/lib/staking";
import { withErrorHandling } from "@/lib/api/route";

export const revalidate = 900;

// Rocket Pool network stats read from its contracts over free RPC.
// Replaces beaconcha.in's Rocket Pool endpoint (its free API tier ended in May 2026).
export const GET = withErrorHandling(async () => {
    return NextResponse.json({ information: { status: 'OK', data: await getRocketPoolStats() } });
});
