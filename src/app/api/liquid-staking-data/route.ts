import { NextResponse } from "next/server";
import { getLiquidStaking } from "@/lib/staking";
import { withErrorHandling } from "@/lib/api/route";

export const revalidate = 900;

// Liquid staking tokens: ETH staked, exchange rate and APR (free RPC + Lido public API).
// Replaces the beaconcha.in validator leaderboard, which has no free equivalent.
export const GET = withErrorHandling(async () => {
    return NextResponse.json({ tokens: await getLiquidStaking() });
});
