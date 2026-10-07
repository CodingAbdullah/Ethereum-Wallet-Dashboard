import { beforeEach, describe, expect, it } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "./db";
import { addWatchedWallet, upsertUser } from "./accounts";
import { portfolioHistory, saveSnapshots, utcDay, walletsMissingSnapshot } from "./snapshots";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const A = '0x0000000000000000000000000000000000000001';
const B = '0x0000000000000000000000000000000000000002';

describe("portfolio snapshots", () => {
    let db: Database;
    const testDb = setupTestDb();
    beforeEach(async () => {
        db = testDb();
        await upsertUser(db, USER);
    });

    it("keeps one value per wallet per day", async () => {
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 100 }], '2026-10-01');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 999 }], '2026-10-01');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 120 }], '2026-10-02');
        expect(await portfolioHistory(db, [{ address: A, chain: 'eth' }], 90, new Date('2026-10-07'))).toEqual([
            { day: '2026-10-01', usdValue: 100, wallets: 1 },
            { day: '2026-10-02', usdValue: 120, wallets: 1 }
        ]);
    });

    it("sums wallets per day and ignores other wallets and old days", async () => {
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 100 }, { address: B, chain: 'eth', usdValue: 50 }], '2026-10-05');
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 1 }], '2026-01-01');
        expect(await portfolioHistory(db, [{ address: A, chain: 'eth' }, { address: B, chain: 'eth' }], 90, new Date('2026-10-07'))).toEqual([{ day: '2026-10-05', usdValue: 150, wallets: 2 }]);
        expect(await portfolioHistory(db, [{ address: B, chain: 'eth' }], 90, new Date('2026-10-07'))).toEqual([{ day: '2026-10-05', usdValue: 50, wallets: 1 }]);
        expect(await portfolioHistory(db, [], 90)).toEqual([]);
    });

    it("lists wallets on valued chains that still need today's snapshot, skipping testnets", async () => {
        await addWatchedWallet(db, USER, { address: A, chain: 'eth' });
        await addWatchedWallet(db, USER, { address: B, chain: 'eth' });
        await addWatchedWallet(db, USER, { address: A, chain: 'base' });
        await addWatchedWallet(db, USER, { address: A, chain: 'sepolia' });
        const today = utcDay();
        expect(await walletsMissingSnapshot(db, today)).toEqual([{ address: A, chain: 'base' }, { address: A, chain: 'eth' }, { address: B, chain: 'eth' }]);

        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 1 }], today);
        expect(await walletsMissingSnapshot(db, today)).toEqual([{ address: A, chain: 'base' }, { address: B, chain: 'eth' }]);
    });

    it("counts the same address separately per chain, and only the pairs asked for", async () => {
        await saveSnapshots(db, [{ address: A, chain: 'eth', usdValue: 100 }, { address: A, chain: 'base', usdValue: 40 }, { address: B, chain: 'arbitrum', usdValue: 7 }], '2026-10-05');
        expect(await portfolioHistory(db, [{ address: A, chain: 'eth' }, { address: A, chain: 'base' }, { address: A, chain: 'sepolia' }], 90, new Date('2026-10-07')))
            .toEqual([{ day: '2026-10-05', usdValue: 140, wallets: 2 }]);
        // B is only saved on Arbitrum, so asking for B on Ethereum finds nothing
        expect(await portfolioHistory(db, [{ address: B, chain: 'eth' }], 90, new Date('2026-10-07'))).toEqual([]);
    });
});
