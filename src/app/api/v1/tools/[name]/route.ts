import { NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { consumeQuota, verifyApiKey } from "@/lib/apiKeys";
import { ToolError, toolByName, toolErrorMessage } from "@/lib/tools";
import { ProviderError } from "@/lib/providers/http";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const error = (message: string, status: number, headers?: Record<string, string>) => NextResponse.json({ error: message }, { status, headers });

// POST /api/v1/tools/{name}: runs one read-only tool with the JSON body as its input.
// Same API keys and daily quota as the MCP server (Authorization: Bearer <key>).
export async function POST(request: Request, { params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const t = toolByName(name);
    if (!t) return error(`Unknown tool: ${name}. See GET /api/v1/tools.`, 404);
    if (!isDatabaseConfigured()) return error('API keys are not configured on this server', 503);

    const key = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    const verified = await verifyApiKey(getDb(), key);
    if (!verified) return error('Missing or invalid API key. Create one at /mcp and send it as "Authorization: Bearer <key>".', 401, { 'www-authenticate': 'Bearer' });

    let body: unknown = {};
    const text = await request.text();
    if (text.trim()) {
        try { body = JSON.parse(text); }
        catch { return error('The body must be JSON', 400); }
    }
    const input = t.input.safeParse(body);
    if (!input.success) return error(toolErrorMessage(input.error), 400);

    const quota = await consumeQuota(getDb(), verified.keyId);
    const headers = { 'x-ratelimit-limit': String(quota.limit), 'x-ratelimit-remaining': String(Math.max(0, quota.limit - quota.used)) };
    if (!quota.allowed) return error(`This API key has used its ${quota.limit} calls for today. The limit resets at 00:00 UTC.`, 429, headers);

    try {
        return NextResponse.json({ data: await t.run(input.data) }, { headers });
    }
    catch (err) {
        if (!(err instanceof ToolError || err instanceof ProviderError || err instanceof z.ZodError)) Sentry.captureException(err);
        return error(toolErrorMessage(err), err instanceof ToolError ? 400 : 502, headers);
    }
}
