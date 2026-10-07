import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { BaseError } from "viem";
import { withErrorHandling, parseBody } from "./route";
import { ProviderError } from "../providers/http";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const failWith = (error: unknown) => withErrorHandling(async () => { throw error; });

describe("withErrorHandling", () => {
    it("passes successful responses through", async () => {
        const handler = withErrorHandling(async () => Response.json({ ok: true }));
        const response = await handler();
        expect(response.status).toBe(200);
    });

    it("returns 400 with the issues for invalid input", async () => {
        const handler = withErrorHandling(async (request: Request) => {
            await parseBody(request, z.object({ address: z.string().min(3, "Address too short") }));
            return Response.json({});
        });

        const response = await handler(postRequest({ address: "0x" }));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid request", issues: ["Address too short"] });
    });

    it("returns 503 when a provider rejects the key or plan", async () => {
        const response = await failWith(new ProviderError("Moralis", 401, "Moralis responded with 401"))();
        expect(response.status).toBe(503);
        expect((await response.json()).error).toContain("free plan");
    });

    it("returns 502 for provider failures", async () => {
        const response = await failWith(new ProviderError("CoinGecko", 500, "CoinGecko responded with 500"))();
        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({ error: "CoinGecko responded with 500" });
    });

    it("returns 502 for RPC failures", async () => {
        const response = await failWith(new BaseError("HTTP request failed."))();
        expect(response.status).toBe(502);
        expect((await response.json()).error).toContain("Ethereum RPC request failed");
    });

    it("hides unexpected errors behind a 500 and reports them to Sentry", async () => {
        const Sentry = await import("@sentry/nextjs");
        vi.spyOn(console, "error").mockImplementation(() => {});

        const response = await failWith(new Error("secret internal detail"))();
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "Internal server error" });
        expect(Sentry.captureException).toHaveBeenCalled();
    });
});

describe("parseBody", () => {
    it("treats a missing or malformed body as empty input", async () => {
        const request = new Request("http://localhost/api/test", { method: "POST", body: "not json" });
        await expect(parseBody(request, z.object({ id: z.string() }))).rejects.toBeInstanceOf(z.ZodError);
    });
});
