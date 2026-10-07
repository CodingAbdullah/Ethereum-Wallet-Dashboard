import { beforeEach, describe, expect, it } from "vitest";
import { setupTestDb } from "@/test/db";
import type { Database } from "../db";
import { notificationChannels, users } from "../db/schema";
import { handleTelegramUpdate, telegramLink } from "./telegram";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
let db: Database;
const msg = (text: string, id = 777) => ({ message: { chat: { id }, text } });

const testDb = setupTestDb();
beforeEach(async () => {
    db = testDb();
    await db.insert(users).values({ address: USER });
    await db.insert(notificationChannels).values({ userAddress: USER, kind: 'telegram', verifyToken: 'tok123' });
});

describe("handleTelegramUpdate", () => {
    it("links a chat with a valid token, once", async () => {
        expect((await handleTelegramUpdate(db, msg('/start tok123')))?.text).toContain('Linked');
        const [channel] = await db.select().from(notificationChannels);
        expect(channel).toMatchObject({ target: '777', verified: true, verifyToken: null });
        expect((await handleTelegramUpdate(db, msg('/start tok123')))?.text).toContain('expired');
    });

    it("rejects expired tokens", async () => {
        const later = new Date(Date.now() + 25 * 60 * 60 * 1000);
        expect((await handleTelegramUpdate(db, msg('/start tok123'), later))?.text).toContain('expired');
    });

    it("unlinks with /stop and ignores other messages", async () => {
        await handleTelegramUpdate(db, msg('/start tok123'));
        expect((await handleTelegramUpdate(db, msg('/stop')))?.text).toContain('Unlinked');
        const [channel] = await db.select().from(notificationChannels);
        expect(channel.verified).toBe(false);
        expect(await handleTelegramUpdate(db, msg('hello'))).toBeNull();
        expect(await handleTelegramUpdate(db, {})).toBeNull();
    });

    it("builds the deep link", () => {
        expect(telegramLink('EthDashBot', 'tok123')).toBe('https://t.me/EthDashBot?start=tok123');
    });
});
