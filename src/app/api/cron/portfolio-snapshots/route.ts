import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { getWalletTokens } from "@/lib/portfolio";
import { saveSnapshots, walletsMissingSnapshot } from "@/lib/snapshots";
import { isAuthorizedCron } from "@/lib/cron";
import type { Network } from "@/lib/validation";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CONCURRENCY = 4;

// GET (Vercel cron, daily): saves today's USD value for every saved wallet (mainnets and L2s) that doesn't have one yet
export const GET = withErrorHandling(async (request: Request) => {
    if (!isAuthorizedCron(request.headers.get('authorization'))) {
        throw new HttpError(401, 'Unauthorized');
    }

    const db = getDb();
    const queue = await walletsMissingSnapshot(db);
    let saved = 0;
    let failed = 0;

    // A few wallets at a time, to stay inside provider rate limits
    const worker = async () => {
        for (let wallet = queue.shift(); wallet; wallet = queue.shift()) {
            try {
                const tokens = await getWalletTokens(wallet.address, wallet.chain as Network);
                await saveSnapshots(db, [{ ...wallet, usdValue: tokens.reduce((sum, t) => sum + t.usdValue, 0) }]);
                saved++;
            }
            catch {
                failed++;
            }
        }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    return NextResponse.json({ saved, failed });
});
