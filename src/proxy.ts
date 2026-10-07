import { NextResponse, type NextRequest } from "next/server";

// Protects the /api routes that spend provider quotas:
// 1. Rejects cross-site browser requests, so other websites can't use this app as a free proxy
// 2. Applies a simple per-IP rate limit
//
// The limiter is in memory, so each server instance counts separately. It is a best-effort guard;
// a shared store (e.g. Upstash Redis's free tier) would make it exact across instances.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;

const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isCrossSite(request: NextRequest): boolean {
    // Modern browsers send Sec-Fetch-Site on every request
    if (request.headers.get('sec-fetch-site') === 'cross-site') return true;

    const origin = request.headers.get('origin');
    if (!origin) return false;

    try {
        return new URL(origin).host !== request.headers.get('host');
    }
    catch {
        return true;
    }
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });

        // Drop expired entries now and then so the map doesn't grow without bound
        if (hits.size > 10_000) {
            for (const [key, value] of hits) if (value.resetAt <= now) hits.delete(key);
        }
        return false;
    }

    entry.count++;
    return entry.count > MAX_REQUESTS_PER_WINDOW;
}

export function proxy(request: NextRequest) {
    if (isCrossSite(request)) {
        return NextResponse.json({ error: 'Cross-site requests are not allowed' }, { status: 403 });
    }

    if (isRateLimited(clientIp(request))) {
        return NextResponse.json({ error: 'Too many requests, please slow down' }, { status: 429, headers: { 'retry-after': '60' } });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*'
};
