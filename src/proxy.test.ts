import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { clientIp, isCrossSite, skipsIpRateLimit, proxy } from "./proxy";

const request = (headers: Record<string, string>) =>
    new NextRequest("https://ethereumdashboard.dev/api/coin-prices", { headers: { host: "ethereumdashboard.dev", ...headers } });

describe("isCrossSite", () => {
    it("allows same-origin browser requests", () => {
        expect(isCrossSite(request({ origin: "https://ethereumdashboard.dev", "sec-fetch-site": "same-origin" }))).toBe(false);
    });

    it("allows requests without an Origin header (server-side and tools)", () => {
        expect(isCrossSite(request({}))).toBe(false);
    });

    it("blocks other websites", () => {
        expect(isCrossSite(request({ "sec-fetch-site": "cross-site" }))).toBe(true);
        expect(isCrossSite(request({ origin: "https://evil.example" }))).toBe(true);
    });

    it("blocks malformed origins", () => {
        expect(isCrossSite(request({ origin: "not a url" }))).toBe(true);
    });
});

describe("clientIp", () => {
    it("uses the first x-forwarded-for address", () => {
        expect(clientIp(request({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
    });

    it("falls back to x-real-ip", () => {
        expect(clientIp(request({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    });
});

describe("proxy", () => {
    it("returns 403 for cross-site requests", async () => {
        const response = await proxy(request({ origin: "https://evil.example" }));
        expect(response.status).toBe(403);
    });

    it("lets same-origin requests through", async () => {
        const response = await proxy(request({ origin: "https://ethereumdashboard.dev", "x-forwarded-for": "198.51.100.1" }));
        expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("returns 429 once an IP exceeds the limit", async () => {
        const headers = { "x-forwarded-for": "198.51.100.77" };
        let last: Response | undefined;
        for (let i = 0; i < 121; i++) last = await proxy(request(headers));
        expect(last?.status).toBe(429);
        expect(last?.headers.get("retry-after")).toBe("60");
    });

    it("doesn't IP rate limit webhooks, scheduled jobs and the MCP server, which have their own checks", async () => {
        expect(skipsIpRateLimit('/api/webhooks/moralis')).toBe(true);
        expect(skipsIpRateLimit('/api/cron/alerts/gas_below')).toBe(true);
        expect(skipsIpRateLimit('/api/mcp')).toBe(true);
        expect(skipsIpRateLimit('/api/mcp-other')).toBe(false);
        expect(skipsIpRateLimit('/api/live')).toBe(false);
    });
});
