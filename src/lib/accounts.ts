import { and, asc, count, eq, sql } from "drizzle-orm";
import { getAddress, type Address } from "viem";
import { HttpError } from "./api/errors";
import type { Database } from "./db";
import { users, watchedWallets, type WatchedWallet } from "./db/schema";
import type { Network } from "./validation";

// Saved wallets for signed-in users.
// The cap keeps daily portfolio snapshots inside Moralis's free 40k compute units/day.
export const MAX_WATCHED_WALLETS = 5;

export async function upsertUser(db: Database, address: Address) {
    await db.insert(users)
        .values({ address })
        .onConflictDoUpdate({ target: users.address, set: { lastSignInAt: sql`now()` } });
}

export async function listWatchedWallets(db: Database, user: Address): Promise<WatchedWallet[]> {
    return db.select().from(watchedWallets).where(eq(watchedWallets.userAddress, user)).orderBy(asc(watchedWallets.createdAt));
}

export async function addWatchedWallet(db: Database, user: Address, wallet: { address: string; chain: Network; label?: string }): Promise<WatchedWallet> {
    const [{ total }] = await db.select({ total: count() }).from(watchedWallets).where(eq(watchedWallets.userAddress, user));
    if (total >= MAX_WATCHED_WALLETS) {
        throw new HttpError(409, `You can save up to ${MAX_WATCHED_WALLETS} wallets`);
    }

    // The user row normally exists from sign-in; this covers sessions created before DATABASE_URL was set
    await db.insert(users).values({ address: user }).onConflictDoNothing();

    const [row] = await db.insert(watchedWallets)
        .values({ userAddress: user, address: getAddress(wallet.address), chain: wallet.chain, label: wallet.label || null })
        .onConflictDoNothing()
        .returning();
    if (!row) throw new HttpError(409, 'This wallet is already saved');
    return row;
}

export async function removeWatchedWallet(db: Database, user: Address, id: number): Promise<boolean> {
    const removed = await db.delete(watchedWallets)
        .where(and(eq(watchedWallets.id, id), eq(watchedWallets.userAddress, user)))
        .returning({ id: watchedWallets.id });
    return removed.length > 0;
}
