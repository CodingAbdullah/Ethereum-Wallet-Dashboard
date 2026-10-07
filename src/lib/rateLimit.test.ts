import { describe, expect, it, vi } from "vitest";
import { createMemoryLimiter, createRateLimiter } from "./rateLimit";

vi.mock("@upstash/redis", () => ({ Redis: vi.fn() }));
vi.mock("@upstash/ratelimit", () => {
    const Ratelimit = vi.fn(function (this: { limit: () => Promise<never> }) {
        this.limit = async () => { throw new Error("Redis unreachable"); };
    }) as unknown as { slidingWindow: () => unknown };
    Ratelimit.slidingWindow = vi.fn();
    return { Ratelimit };
});

describe("createMemoryLimiter", () => {
    it("allows requests up to the limit, then blocks", async () => {
        const limiter = createMemoryLimiter(3, 60_000, () => 0);
        const results = [];
        for (let i = 0; i < 4; i++) results.push(await limiter.isLimited("1.1.1.1"));
        expect(results).toEqual([false, false, false, true]);
    });

    it("counts each IP separately", async () => {
        const limiter = createMemoryLimiter(1, 60_000, () => 0);
        expect(await limiter.isLimited("1.1.1.1")).toBe(false);
        expect(await limiter.isLimited("2.2.2.2")).toBe(false);
        expect(await limiter.isLimited("1.1.1.1")).toBe(true);
    });

    it("resets after the window", async () => {
        let now = 0;
        const limiter = createMemoryLimiter(1, 60_000, () => now);
        await limiter.isLimited("1.1.1.1");
        expect(await limiter.isLimited("1.1.1.1")).toBe(true);

        now = 60_001;
        expect(await limiter.isLimited("1.1.1.1")).toBe(false);
    });
});

describe("createRateLimiter", () => {
    it("uses the in-memory limiter when Upstash is not configured", async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        createRateLimiter({});
        expect(Ratelimit).not.toHaveBeenCalled();
    });

    it("uses Upstash when configured, and falls back to memory if Redis is unreachable", async () => {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const limiter = createRateLimiter({ UPSTASH_REDIS_REST_URL: "https://example.upstash.io", UPSTASH_REDIS_REST_TOKEN: "token" });

        expect(Ratelimit).toHaveBeenCalled();
        await expect(limiter.isLimited("1.1.1.1")).resolves.toBe(false);
    });
});
