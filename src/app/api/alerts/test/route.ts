import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { sendTestAlert } from "@/lib/alerts/accounts";

export const dynamic = 'force-dynamic';

// POST: send a test alert to one of the user's channels ({ channelId })
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { channelId } = await parseBody(request, z.object({ channelId: z.number().int().positive() }));
    await sendTestAlert(getDb(), address, channelId);
    return NextResponse.json({ ok: true });
});
