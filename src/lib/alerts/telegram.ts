import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../db";
import { notificationChannels } from "../db/schema";

// The Telegram bot's side of linking a chat. The /alerts page creates a pending Telegram channel with a
// one-time token and links to t.me/<bot>?start=<token>; pressing Start sends "/start <token>" here.

export const LINK_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export interface TelegramUpdate { message?: { chat?: { id?: number | string }; text?: string } }

export function telegramLink(bot: string, token: string): string {
    return `https://t.me/${encodeURIComponent(bot)}?start=${encodeURIComponent(token)}`;
}

// Returns the bot's reply, or null to stay quiet. The database is only opened for commands,
// so chatter in the chat never fails (Telegram retries failed deliveries).
export async function handleTelegramUpdate(database: Database | (() => Database), update: TelegramUpdate, now = new Date()): Promise<{ chatId: string; text: string } | null> {
    const chatId = update.message?.chat?.id;
    const text = update.message?.text?.trim() ?? '';
    if (chatId === undefined || !text.startsWith('/')) return null;
    const chat = String(chatId);
    const [command, token] = text.split(/\s+/);
    const db = () => typeof database === 'function' ? database() : database;

    if (command === '/start' || command.startsWith('/start@')) {
        if (!token) return { chatId: chat, text: 'Hi! To get alerts here, open ethereumdashboard.dev/alerts, add a Telegram channel and press the link it gives you.' };
        const [linked] = await db().update(notificationChannels)
            .set({ target: chat, verified: true, verifyToken: null })
            .where(and(
                eq(notificationChannels.kind, 'telegram'),
                eq(notificationChannels.verifyToken, token),
                gt(notificationChannels.createdAt, new Date(now.getTime() - LINK_TOKEN_TTL_MS))
            ))
            .returning({ id: notificationChannels.id });
        return {
            chatId: chat,
            text: linked
                ? 'Linked! Your Ethereum Dashboard alerts will arrive in this chat. Send /stop to unlink it.'
                : 'That link has expired or was already used. Create a new Telegram channel on ethereumdashboard.dev/alerts.'
        };
    }

    if (command === '/stop' || command.startsWith('/stop@')) {
        const unlinked = await db().update(notificationChannels)
            .set({ verified: false })
            .where(and(eq(notificationChannels.kind, 'telegram'), eq(notificationChannels.target, chat)))
            .returning({ id: notificationChannels.id });
        return { chatId: chat, text: unlinked.length ? 'Unlinked. No more alerts will be sent to this chat.' : 'This chat is not linked to any alerts.' };
    }
    return null;
}
