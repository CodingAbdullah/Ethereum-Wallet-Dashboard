import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { AuthNotConfiguredError, isAuthConfigured } from "@/lib/auth/session";
import { nonceStore } from "@/lib/auth/store";

export const dynamic = 'force-dynamic';

// GET: a fresh single-use nonce for the Sign-In with Ethereum message
export const GET = withErrorHandling(async () => {
    if (!isAuthConfigured()) throw new AuthNotConfiguredError();
    const nonce = await nonceStore.create();
    return NextResponse.json({ nonce }, { headers: { 'cache-control': 'no-store' } });
});
