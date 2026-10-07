import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listWatchedWallets } from "@/lib/accounts";
import { getWalletInsights } from "@/lib/walletInsights";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET: token approvals, DeFi positions and the readable activity feed for the signed-in user's saved wallets.
// Separate from /api/portfolio so the main numbers on /me don't wait for these.
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    const wallets = await listWatchedWallets(getDb(), address);
    return NextResponse.json(await getWalletInsights(wallets), { headers: { 'cache-control': 'private, no-store' } });
});
