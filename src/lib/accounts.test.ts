import { beforeEach, describe, expect, it } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "./db";
import { users } from "./db/schema";
import { MAX_WATCHED_WALLETS, addWatchedWallet, listWatchedWallets, removeWatchedWallet, upsertUser } from "./accounts";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER_USER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const wallet = (n: number) => '0x' + n.toString(16).padStart(40, '0');

describe("saved wallets", () => {
    let db: Database;
    const testDb = setupTestDb();
    beforeEach(async () => {
        db = testDb();
        await upsertUser(db, USER);
    });

    it("upserts users on repeat sign-in", async () => {
        await upsertUser(db, USER);
        expect(await db.select().from(users)).toHaveLength(1);
    });

    it("adds, lists and removes wallets with checksummed addresses", async () => {
        const saved = await addWatchedWallet(db, USER, { address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', chain: 'eth', label: 'Vitalik' });
        expect(saved).toMatchObject({ address: USER, chain: 'eth', label: 'Vitalik', userAddress: USER });

        expect(await listWatchedWallets(db, USER)).toHaveLength(1);
        expect(await removeWatchedWallet(db, USER, saved.id)).toBe(true);
        expect(await listWatchedWallets(db, USER)).toHaveLength(0);
    });

    it("rejects duplicates but allows the same address on another chain", async () => {
        await addWatchedWallet(db, USER, { address: wallet(1), chain: 'eth' });
        await expect(addWatchedWallet(db, USER, { address: wallet(1), chain: 'eth' })).rejects.toMatchObject({ status: 409 });
        await expect(addWatchedWallet(db, USER, { address: wallet(1), chain: 'sepolia' })).resolves.toBeTruthy();
    });

    it(`caps each user at ${MAX_WATCHED_WALLETS} wallets`, async () => {
        for (let i = 1; i <= MAX_WATCHED_WALLETS; i++) await addWatchedWallet(db, USER, { address: wallet(i), chain: 'eth' });
        await expect(addWatchedWallet(db, USER, { address: wallet(99), chain: 'eth' })).rejects.toMatchObject({ status: 409 });
    });

    it("keeps users' wallets separate", async () => {
        const saved = await addWatchedWallet(db, USER, { address: wallet(1), chain: 'eth' });
        // Creates the user row on the fly for sessions started before the database was set up
        await addWatchedWallet(db, OTHER_USER, { address: wallet(2), chain: 'eth' });

        expect((await listWatchedWallets(db, OTHER_USER)).map(w => w.address)).toEqual([wallet(2)]);
        expect(await removeWatchedWallet(db, OTHER_USER, saved.id)).toBe(false);
        expect(await listWatchedWallets(db, USER)).toHaveLength(1);
    });
});
