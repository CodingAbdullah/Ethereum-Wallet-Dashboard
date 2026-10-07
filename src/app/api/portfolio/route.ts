import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listWatchedWallets } from "@/lib/accounts";
import { getPortfolio } from "@/lib/portfolio";
import { portfolioHistory, saveSnapshots } from "@/lib/snapshots";
import { hasMarketValue } from "@/lib/chains";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET: combined portfolio for the signed-in user's saved wallets, plus value over time
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    const db = getDb();
    const wallets = await listWatchedWallets(db, address);
    const portfolio = await getPortfolio(wallets);

    // Record today's value right away, so the chart has a point before the first cron run
    await saveSnapshots(db, portfolio.wallets
        .filter(w => hasMarketValue(w.wallet.chain) && w.usdValue !== null)
        .map(w => ({ address: w.wallet.address, chain: w.wallet.chain, usdValue: w.usdValue! })));

    const history = await portfolioHistory(db, wallets);

    return NextResponse.json({ ...portfolio, history }, { headers: { 'cache-control': 'private, no-store' } });
});
