import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createSubscription, deleteSubscription, listSubscriptions, setSubscriptionEnabled } from "@/lib/alerts/accounts";

export const dynamic = 'force-dynamic';

const newBody = z.object({ kind: z.string().max(40), channelId: z.number().int().positive(), params: z.record(z.string(), z.unknown()).default({}) });
const toggleBody = z.object({ id: z.number().int().positive(), enabled: z.boolean() });
const idBody = z.object({ id: z.number().int().positive() });

// GET: the signed-in user's alerts
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    return NextResponse.json(await listSubscriptions(getDb(), address));
});

// POST: create an alert ({ kind, channelId, params }); params are checked against the alert type
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const body = await parseBody(request, newBody);
    return NextResponse.json(await createSubscription(getDb(), address, body), { status: 201 });
});

// PATCH: pause or resume an alert ({ id, enabled })
export const PATCH = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { id, enabled } = await parseBody(request, toggleBody);
    return NextResponse.json(await setSubscriptionEnabled(getDb(), address, id, enabled));
});

// DELETE: remove an alert ({ id })
export const DELETE = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { id } = await parseBody(request, idBody);
    if (!(await deleteSubscription(getDb(), address, id))) throw new HttpError(404, 'Alert not found');
    return NextResponse.json({ ok: true });
});
