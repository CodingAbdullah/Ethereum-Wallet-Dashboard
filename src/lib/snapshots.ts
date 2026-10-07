import { and, asc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import type { Database } from "./db";
import { portfolioSnapshots, watchedWallets } from "./db/schema";

// Daily portfolio snapshots (USD value per wallet per day). Only mainnet wallets have market value.

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

// Mainnet wallets saved by anyone that don't have a snapshot for `day` yet
export async function walletsMissingSnapshot(db: Database, day = utcDay(), limit = MAX_SNAPSHOTS_PER_RUN): Promise<string[]> {
    const rows = await db.selectDistinct({ address: watchedWallets.address })
        .from(watchedWallets)
        .leftJoin(portfolioSnapshots, and(
            eq(portfolioSnapshots.address, watchedWallets.address),
            eq(portfolioSnapshots.chain, watchedWallets.chain),
            eq(portfolioSnapshots.day, day)
        ))
        .where(and(eq(watchedWallets.chain, 'eth'), sql`${portfolioSnapshots.id} is null`))
        .orderBy(asc(watchedWallets.address))
        .limit(limit);
    return rows.map(r => r.address);
}

// Total value per day across the given mainnet wallets, oldest first
export async function portfolioHistory(db: Database, addresses: string[], days = HISTORY_DAYS, today = new Date()): Promise<{ day: string; usdValue: number; wallets: number }[]> {
    if (addresses.length === 0) return [];
    const since = utcDay(new Date(today.getTime() - days * 24 * 60 * 60 * 1000));
    const rows = await db.select({
        day: portfolioSnapshots.day,
        usdValue: sum(portfolioSnapshots.usdValue).mapWith(Number),
        wallets: sql<number>`count(*)`.mapWith(Number)
    })
        .from(portfolioSnapshots)
        .where(and(inArray(portfolioSnapshots.address, addresses), eq(portfolioSnapshots.chain, 'eth'), gte(portfolioSnapshots.day, since)))
        .groupBy(portfolioSnapshots.day)
        .orderBy(asc(portfolioSnapshots.day));
    return rows;
}
