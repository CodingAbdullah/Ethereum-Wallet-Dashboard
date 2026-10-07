import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/apiKeys";

export const dynamic = 'force-dynamic';

// GET: the signed-in user's MCP API keys (never the keys themselves) and today's usage
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    return NextResponse.json(await listApiKeys(getDb(), address));
});

// POST: create a key ({ name }). The key is returned once and can't be shown again.
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { name } = await parseBody(request, z.object({ name: z.string().trim().min(1, 'Give the key a name').max(40, 'Name must be 40 characters or fewer') }));
    return NextResponse.json(await createApiKey(getDb(), address, name), { status: 201 });
});

// DELETE: revoke a key ({ id })
export const DELETE = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { id } = await parseBody(request, z.object({ id: z.number().int().positive() }));
    if (!(await revokeApiKey(getDb(), address, id))) throw new HttpError(404, 'Key not found');
    return NextResponse.json({ ok: true });
});
