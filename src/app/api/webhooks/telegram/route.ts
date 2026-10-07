import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { verifyTelegramSecret } from "@/lib/alerts/signing";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/alerts/telegram";

export const dynamic = 'force-dynamic';

// POST from Telegram (registered with setWebhook and secret_token = TELEGRAM_WEBHOOK_SECRET).
// The reply goes back in the response body, which Telegram runs as a Bot API call.
export const POST = withErrorHandling(async (request: Request) => {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) throw new HttpError(503, 'Telegram is not configured on this server (TELEGRAM_WEBHOOK_SECRET is missing)');
    if (!verifyTelegramSecret(secret, request.headers.get('x-telegram-bot-api-secret-token'))) throw new HttpError(401, 'Unauthorized');

    const update = await request.json().catch(() => ({})) as TelegramUpdate;
    const reply = await handleTelegramUpdate(getDb, update);
    if (!reply) return NextResponse.json({ ok: true });
    return NextResponse.json({ method: 'sendMessage', chat_id: reply.chatId, text: reply.text });
});
