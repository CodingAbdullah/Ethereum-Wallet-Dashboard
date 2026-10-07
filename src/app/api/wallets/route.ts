import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { addWatchedWallet, listWatchedWallets, removeWatchedWallet } from "@/lib/accounts";
import { addressSchema, networkSchema } from "@/lib/validation";

export const dynamic = 'force-dynamic';

const addWalletBody = z.object({
    address: addressSchema,
    chain: networkSchema,
    label: z.string().trim().max(40, 'Label must be 40 characters or fewer').optional()
});

const removeWalletBody = z.object({ id: z.number().int().positive() });

// GET: the signed-in user's saved wallets
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    return NextResponse.json(await listWatchedWallets(getDb(), address));
});

// POST: save a wallet ({ address, chain?, label? })
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const wallet = await parseBody(request, addWalletBody);
    return NextResponse.json(await addWatchedWallet(getDb(), address, wallet), { status: 201 });
});

// DELETE: remove a saved wallet ({ id })
export const DELETE = withErrorHandling(async (request: Request) => {
    const { address } = await requireSession();
    const { id } = await parseBody(request, removeWalletBody);
    if (!(await removeWatchedWallet(getDb(), address, id))) throw new HttpError(404, 'Wallet not found');
    return NextResponse.json({ ok: true });
});
