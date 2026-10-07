import { describe, expect, it, vi } from "vitest";
import { etherscan } from "./etherscan";
import { json, mockFetch } from "@/test/helpers";

describe("etherscan", () => {
    it("calls the V2 API with the network's chain ID and the API key", async () => {
        vi.stubEnv("ETHERSCAN_API_KEY", "test-key");
        const fetchMock = mockFetch(json({ status: "1", message: "OK", result: "1000" }));

        await etherscan({ module: "account", action: "balance", address: "0xabc" }, "hoodi");

        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.origin + url.pathname).toBe("https://api.etherscan.io/v2/api");
        expect(url.searchParams.get("chainid")).toBe("560048");
        expect(url.searchParams.get("action")).toBe("balance");
        expect(url.searchParams.get("apikey")).toBe("test-key");
    });

    it("returns an empty result when the wallet has no transactions", async () => {
        mockFetch(json({ status: "0", message: "No transactions found", result: [] }));

        const data = await etherscan<unknown[]>({ module: "account", action: "txlist", address: "0xabc" });
        expect(data.result).toEqual([]);
    });

    it("treats key and rate-limit errors as plan-restricted", async () => {
        mockFetch(json({ status: "0", message: "NOTOK", result: "Max rate limit reached" }));

        await expect(etherscan({ module: "account", action: "txlist" })).rejects.toMatchObject({ status: 403, isPlanRestricted: true });
    });

    it("reports other Etherscan errors as provider failures", async () => {
        mockFetch(json({ status: "0", message: "NOTOK", result: "Error! Invalid address format" }));

        await expect(etherscan({ module: "account", action: "txlist" })).rejects.toMatchObject({ status: 502 });
    });
});
