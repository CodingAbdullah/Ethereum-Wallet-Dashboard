import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getSession, isAuthConfigured } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET: the signed-in address (or null), and which account features this server has turned on
export const GET = withErrorHandling(async () => {
    const session = await getSession();
    return NextResponse.json({
        address: session?.address ?? null,
        authEnabled: isAuthConfigured(),
        accountsEnabled: isAuthConfigured() && isDatabaseConfigured()
    }, { headers: { 'cache-control': 'no-store' } });
});
