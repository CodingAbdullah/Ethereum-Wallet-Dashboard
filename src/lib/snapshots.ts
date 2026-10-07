import { and, asc, eq, gte, inArray, or, sql, sum } from "drizzle-orm";
import type { Database } from "./db";
import { portfolioSnapshots, watchedWallets } from "./db/schema";
import { CHAIN_KEYS, hasMarketValue } from "./chains";

// Daily portfolio snapshots (USD value per wallet per day). Testnet wallets have no market value, so they're skipped.

export interface WalletRef {
    address: string;
    chain: string;
}

const VALUED_CHAINS = CHAIN_KEYS.filter(hasMarketValue);

export const HISTORY_DAYS = 90;
// Upper bound per cron run, to stay inside Moralis's free 40k compute units/day and the function time limit
export const MAX_SNAPSHOTS_PER_RUN = 300;

export function utcDay(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

// Saves today's value for each wallet; keeps the first value of the day if one exists
export async function saveSnapshots(db: Database, values: { address: string; chain: string; usdValue: number }[], day = utcDay()) {
    if (values.length === 0) return;
    await db.insert(portfolioSnapshots)
        .values(values.map(v => ({ ...v, day })))
        .onConflictDoNothing();
}

// Wallets (on chains with market value) saved by anyone that don't have a snapshot for `day` yet
export async function walletsMissingSnapshot(db: Database, day = utcDay(), limit = MAX_SNAPSHOTS_PER_RUN): Promise<WalletRef[]> {
    const rows = await db.selectDistinct({ address: watchedWallets.address, chain: watchedWallets.chain })
        .from(watchedWallets)
        .leftJoin(portfolioSnapshots, and(
            eq(portfolioSnapshots.address, watchedWallets.address),
            eq(portfolioSnapshots.chain, watchedWallets.chain),
            eq(portfolioSnapshots.day, day)
        ))
        .where(and(inArray(watchedWallets.chain, VALUED_CHAINS), sql`${portfolioSnapshots.id} is null`))
        .orderBy(asc(watchedWallets.address), asc(watchedWallets.chain))
        .limit(limit);
    return rows;
}

// Total value per day across the given wallets, oldest first
export async function portfolioHistory(db: Database, wallets: WalletRef[], days = HISTORY_DAYS, today = new Date()): Promise<{ day: string; usdValue: number; wallets: number }[]> {
    const valued = wallets.filter(w => hasMarketValue(w.chain));
    if (valued.length === 0) return [];
    const since = utcDay(new Date(today.getTime() - days * 24 * 60 * 60 * 1000));
    const rows = await db.select({
        day: portfolioSnapshots.day,
        usdValue: sum(portfolioSnapshots.usdValue).mapWith(Number),
        wallets: sql<number>`count(*)`.mapWith(Number)
    })
        .from(portfolioSnapshots)
        .where(and(
            or(...valued.map(w => and(eq(portfolioSnapshots.address, w.address), eq(portfolioSnapshots.chain, w.chain)))),
            gte(portfolioSnapshots.day, since)
        ))
        .groupBy(portfolioSnapshots.day)
        .orderBy(asc(portfolioSnapshots.day));
    return rows;
}
