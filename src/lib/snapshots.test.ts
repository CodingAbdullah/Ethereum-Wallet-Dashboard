import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "@/test/db";
import type { Database } from "./db";
import { addWatchedWallet, upsertUser } from "./accounts";
import { portfolioHistory, saveSnapshots, utcDay, walletsMissingSnapshot } from "./snapshots";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const A = '0x0000000000000000000000000000000000000001';
const B = '0x0000000000000000000000000000000000000002';

describe("portfolio snapshots", () => {
    let db: Database;
    beforeEach(async () => {
        db = await createTestDb();
        await upsertUser(db, USER);
    });

    it("keeps one value per wallet per day", async () => {
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 100 }], '2026-10-01');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 999 }], '2026-10-01');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 120 }], '2026-10-02');
        expect(await portfolioHistory(db, [A], 90, new Date('2026-10-07'))).toEqual([
            { day: '2026-10-01', usdValue: 100, wallets: 1 },
            { day: '2026-10-02', usdValue: 120, wallets: 1 }
        ]);
    });

    it("sums wallets per day and ignores other wallets and old days", async () => {
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 100 }, { address: B, chain: 'eth', usdValue: 50 }], '2026-10-05');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 1 }], '2026-01-01');
        expect(await portfolioHistory(db, [A, B], 90, new Date('2026-10-07'))).toEqual([{ day: '2026-10-05', usdValue: 150, wallets: 2 }]);
        expect(await portfolioHistory(db, [B], 90, new Date('2026-10-07'))).toEqual([{ day: '2026-10-05', usdValue: 50, wallets: 1 }]);
        expect(await portfolioHistory(db, [], 90)).toEqual([]);
    });

    it("lists mainnet wallets that still need today's snapshot", async () => {
        await addWatchedWallet(db, USER, { address: A, chain: 'eth' });
        await addWatchedWallet(db, USER, { address: B, chain: 'eth' });
        await addWatchedWallet(db, USER, { address: A, chain: 'sepolia' });
        const today = utcDay();
        expect(await walletsMissingSnapshot(db, today)).toEqual([A, B]);

        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 1 }], today);
        expect(await walletsMissingSnapshot(db, today)).toEqual([B]);
    });
});
