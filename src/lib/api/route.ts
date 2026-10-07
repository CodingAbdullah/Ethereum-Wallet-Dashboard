import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { BaseError as ViemError } from "viem";
import { ProviderError } from "../providers/http";
import { HttpError } from "./errors";

// Wraps a route handler so every route returns the same error format:
// 400 for invalid input, HttpError's own status (401, 409, ...), 503 for endpoints outside a provider's free plan, 502 for provider and RPC failures
export function withErrorHandling<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
    return async (...args: Args): Promise<Response> => {
        try {
            return await handler(...args);
        }
        catch (err) {
            if (err instanceof HttpError) {
                return NextResponse.json({ error: err.message }, { status: err.status });
            }
            if (err instanceof z.ZodError) {
                return NextResponse.json({ error: 'Invalid request', issues: err.issues.map(issue => issue.message) }, { status: 400 });
            }
            if (err instanceof ProviderError) {
                // Provider problems are reported as warnings: a rejected key or plan limit, or an outage
                Sentry.captureException(err, { level: 'warning', tags: { provider: err.provider, status: err.status } });
                if (err.isPlanRestricted) {
                    return NextResponse.json({ error: `${err.provider} rejected the request. Check the API key, or this endpoint may not be available on the free plan.` }, { status: 503 });
                }
                return NextResponse.json({ error: err.message }, { status: 502 });
            }
            if (err instanceof ViemError) {
                Sentry.captureException(err, { level: 'warning' });
                return NextResponse.json({ error: 'Ethereum RPC request failed: ' + err.shortMessage }, { status: 502 });
            }
            // Unexpected errors are bugs: log them and report them to Sentry (when configured)
            console.error(err);
            Sentry.captureException(err);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

// Parse a JSON request body against a Zod schema (throws ZodError on bad input)
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        body = {};
    }
    return schema.parse(body);
}
