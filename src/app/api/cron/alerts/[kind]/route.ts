import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { isAuthorizedCron } from "@/lib/cron";
import { alertKind } from "@/lib/alerts/kinds";
import { runCheck } from "@/lib/alerts/engine";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Runs one alert type's check for every subscriber. Called by the n8n scheduler workflow
// (n8n/alerts-scheduler.json) at each type's interval, with "Authorization: Bearer <CRON_SECRET>".
async function handler(request: Request, { params }: { params: Promise<{ kind: string }> }) {
    if (!isAuthorizedCron(request.headers.get('authorization'))) throw new HttpError(401, 'Unauthorized');
    const { kind } = await params;
    if (!alertKind(kind)) throw new HttpError(404, 'Unknown alert type');
    return NextResponse.json(await runCheck(getDb(), kind));
}

export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);
