import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { AuthNotConfiguredError, SESSION_COOKIE, createSessionToken, isAuthConfigured, sessionCookieOptions } from "@/lib/auth/session";
import { verifySignIn } from "@/lib/auth/siwe";
import { nonceStore } from "@/lib/auth/store";
import { rpcClient } from "@/lib/providers/rpc";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { upsertUser } from "@/lib/accounts";

export const dynamic = 'force-dynamic';

const verifyBody = z.object({
    message: z.string().min(1).max(2000),
    signature: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Invalid signature').max(20_000).transform(s => s as `0x${string}`)
});

// POST: checks a signed Sign-In with Ethereum message and starts a session
export const POST = withErrorHandling(async (request: Request) => {
    if (!isAuthConfigured()) throw new AuthNotConfiguredError();
    const { message, signature } = await parseBody(request, verifyBody);

    const { address, chainId } = await verifySignIn({
        message,
        signature,
        host: request.headers.get('host') ?? '',
        nonces: nonceStore,
        client: rpcClient
    });

    if (isDatabaseConfigured()) await upsertUser(getDb(), address);

    const response = NextResponse.json({ address, chainId });
    response.cookies.set(SESSION_COOKIE, await createSessionToken({ address, chainId }), sessionCookieOptions);
    return response;
});
