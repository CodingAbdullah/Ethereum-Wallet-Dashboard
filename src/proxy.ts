import { NextResponse, type NextRequest } from "next/server";
import { createRateLimiter } from "./lib/rateLimit";

// Protects the /api routes that spend provider quotas:
// 1. Rejects cross-site browser requests, so other websites can't use this app as a free proxy
// 2. Applies a per-IP rate limit (shared through Upstash Redis when configured, see src/lib/rateLimit.ts).
//    Webhooks, scheduled jobs and the MCP server are skipped: they check their own signature, secret or
//    API key (with a per-key quota), and their callers (Moralis, Telegram, MCP clients) share a few IPs.

const rateLimiter = createRateLimiter();

export function clientIp(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function isCrossSite(request: NextRequest): boolean {
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

export function skipsIpRateLimit(pathname: string): boolean {
    return pathname.startsWith('/api/webhooks/') || pathname.startsWith('/api/cron/') || pathname === '/api/mcp';
}

export async function proxy(request: NextRequest) {
    if (isCrossSite(request)) {
        return NextResponse.json({ error: 'Cross-site requests are not allowed' }, { status: 403 });
    }

    if (!skipsIpRateLimit(request.nextUrl.pathname) && await rateLimiter.isLimited(clientIp(request))) {
        return NextResponse.json({ error: 'Too many requests, please slow down' }, { status: 429, headers: { 'retry-after': '60' } });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*'
};
