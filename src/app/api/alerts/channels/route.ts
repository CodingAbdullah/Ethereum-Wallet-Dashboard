import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createChannel, deleteChannel, listChannels } from "@/lib/alerts/accounts";

export const dynamic = 'force-dynamic';

const newChannelBody = z.object({
    kind: z.enum(['telegram', 'discord', 'email']),
    target: z.string().trim().max(300).optional(),
    label: z.string().trim().max(40, 'Label must be 40 characters or fewer').optional()
});
const idBody = z.object({ id: z.number().int().positive() });

// GET: the signed-in user's notification channels
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    return NextResponse.json(await listChannels(getDb(), address));
});

// POST: add a channel ({ kind, target?, label? }). Telegram returns a link to open the bot.
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const body = await parseBody(request, newChannelBody);
    return NextResponse.json(await createChannel(getDb(), address, body, new URL(request.url).origin), { status: 201 });
});

// DELETE: remove a channel and its alerts ({ id })
export const DELETE = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { id } = await parseBody(request, idBody);
    if (!(await deleteChannel(getDb(), address, id))) throw new HttpError(404, 'Channel not found');
    return NextResponse.json({ ok: true });
});
