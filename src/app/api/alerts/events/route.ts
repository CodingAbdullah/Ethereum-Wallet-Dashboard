import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listEvents } from "@/lib/alerts/accounts";

export const dynamic = 'force-dynamic';

// GET: the signed-in user's 50 most recent alerts and whether each was delivered
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    return NextResponse.json(await listEvents(getDb(), address));
});
