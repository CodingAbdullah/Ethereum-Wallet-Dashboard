import { describe, expect, it, vi } from "vitest";
import { providerFetch, ProviderError } from "./http";
import { json, mockFetch } from "@/test/helpers";

describe("providerFetch", () => {
    it("returns parsed JSON and caches through the Next.js data cache", async () => {
        const fetchMock = mockFetch(json({ ok: true }));

        await expect(providerFetch("Test", "https://api.test/x", { revalidate: 120 })).resolves.toEqual({ ok: true });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: { revalidate: number } }];
        expect(init.next).toEqual({ revalidate: 120 });
        expect(init.cache).toBeUndefined();
    });

    it("uses no-store when caching is disabled", async () => {
        const fetchMock = mockFetch(json({}));
        await providerFetch("Test", "https://api.test/x", { revalidate: false });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.cache).toBe("no-store");
    });

    it("drops headers whose value is undefined (e.g. an unset optional API key)", async () => {
        const fetchMock = mockFetch(json({}));
        await providerFetch("Test", "https://api.test/x", { headers: { "x-api-key": undefined, "x-other": "1" } });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.headers).toEqual({ accept: "application/json", "x-other": "1" });
    });

    it("retries once on a rate limit and then succeeds", async () => {
        vi.useFakeTimers();
        const fetchMock = mockFetch(json({}, 429), json({ data: 1 }));

        const result = providerFetch("Test", "https://api.test/x");
        await vi.runAllTimersAsync();

        await expect(result).resolves.toEqual({ data: 1 });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });

    it("does not retry client errors", async () => {
        const fetchMock = mockFetch(json({}, 404));

        await expect(providerFetch("Test", "https://api.test/x")).rejects.toMatchObject({ provider: "Test", status: 404 });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("turns repeated network failures into a 504 ProviderError", async () => {
        mockFetch(new TypeError("fetch failed"), new TypeError("fetch failed"));

        const error = await providerFetch("Test", "https://api.test/x").catch((err: unknown) => err);
        expect(error).toBeInstanceOf(ProviderError);
        expect((error as ProviderError).status).toBe(504);
    });

    it.each([[401, true], [402, true], [403, true], [429, false], [500, false]])("status %i plan-restricted: %s", (status, expected) => {
        expect(new ProviderError("Test", status, "x").isPlanRestricted).toBe(expected);
    });
});
