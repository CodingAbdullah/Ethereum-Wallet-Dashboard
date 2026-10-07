import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { getWalletTokens } from "@/lib/portfolio";
import { saveSnapshots, walletsMissingSnapshot } from "@/lib/snapshots";
import { isAuthorizedCron } from "@/lib/cron";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CONCURRENCY = 4;

// GET (Vercel cron, daily): saves today's USD value for every saved mainnet wallet that doesn't have one yet
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
        for (let address = queue.shift(); address; address = queue.shift()) {
            try {
                const tokens = await getWalletTokens(address, 'eth');
                await saveSnapshots(db, [{ address, chain: 'eth', usdValue: tokens.reduce((sum, t) => sum + t.usdValue, 0) }]);
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
