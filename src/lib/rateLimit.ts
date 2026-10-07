import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Per-IP rate limit for the /api routes.
// With UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set (Upstash free tier), the count is shared
// by every server instance. Without them it falls back to an in-memory count per instance.

export const WINDOW_SECONDS = 60;
export const MAX_REQUESTS_PER_WINDOW = 120;

export interface RateLimiter {
    isLimited(key: string): Promise<boolean>;
}

export function createMemoryLimiter(limit = MAX_REQUESTS_PER_WINDOW, windowMs = WINDOW_SECONDS * 1000, now: () => number = Date.now): RateLimiter {
    const hits = new Map<string, { count: number; resetAt: number }>();

    return {
        async isLimited(key: string) {
            const time = now();
            const entry = hits.get(key);

            if (!entry || entry.resetAt <= time) {
                hits.set(key, { count: 1, resetAt: time + windowMs });

                // Drop expired entries now and then so the map doesn't grow without bound
                if (hits.size > 10_000) {
                    for (const [k, v] of hits) if (v.resetAt <= time) hits.delete(k);
                }
                return false;
            }

            entry.count++;
            return entry.count > limit;
        }
    };
}

export interface LimiterOptions { limit: number; windowSeconds: number; prefix: string }
const API_LIMIT: LimiterOptions = { limit: MAX_REQUESTS_PER_WINDOW, windowSeconds: WINDOW_SECONDS, prefix: 'eth-dashboard:api' };

function createUpstashLimiter(url: string, token: string, options: LimiterOptions): RateLimiter {
    const ratelimit = new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(options.limit, `${options.windowSeconds} s`),
        prefix: options.prefix,
        // Keep a local cache of blocked IPs so repeat offenders don't cost Redis calls
        ephemeralCache: new Map()
    });

    // Fallback for when Redis is unreachable, so an Upstash outage doesn't take the API down
    const fallback = createMemoryLimiter(options.limit, options.windowSeconds * 1000);

    return {
        async isLimited(key: string) {
            try {
                const { success } = await ratelimit.limit(key);
                return !success;
            }
            catch {
                return fallback.isLimited(key);
            }
        }
    };
}

// The default is the per-IP limit for /api; other features (the AI agent) pass their own limit and prefix
export function createRateLimiter(env: Record<string, string | undefined> = process.env, options: LimiterOptions = API_LIMIT): RateLimiter {
    const url = env.UPSTASH_REDIS_REST_URL;
    const token = env.UPSTASH_REDIS_REST_TOKEN;
    return url && token ? createUpstashLimiter(url, token, options) : createMemoryLimiter(options.limit, options.windowSeconds * 1000);
}
