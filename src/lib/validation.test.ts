import { describe, expect, it } from "vitest";
import { addressSchema, coinIdSchema, ensNameSchema, intervalSchema, marketChartQuery, networkSchema, tokenIdSchema } from "./validation";

describe("validation schemas", () => {
    it.each([
        ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", true],
        ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045", true],
        ["  0xd8da6bf26964af9d7eed9e03e53415d37aa96045  ", true],
        ["0x123", false],
        ["vitalik.eth", false],
        ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045&evil=1", false]
    ])("address %s valid: %s", (value, valid) => {
        expect(addressSchema.safeParse(value).success).toBe(valid);
    });

    it("defaults the network to mainnet and rejects retired testnets", () => {
        expect(networkSchema.parse(undefined)).toBe("eth");
        expect(networkSchema.parse("hoodi")).toBe("hoodi");
        expect(networkSchema.safeParse("holesky").success).toBe(false);
    });

    it.each([
        ["vitalik.eth", true],
        ["Vitalik.ETH", true],
        ["🦊.eth", true],
        ["sub.name.eth", true],
        ["vitalik", false],
        ["bad name.eth", false]
    ])("ENS name %s valid: %s", (value, valid) => {
        expect(ensNameSchema.safeParse(value).success).toBe(valid);
    });

    it("normalizes ENS names", () => {
        expect(ensNameSchema.parse("Vitalik.ETH")).toBe("vitalik.eth");
    });

    it("only accepts numeric token IDs", () => {
        expect(tokenIdSchema.safeParse("1234").success).toBe(true);
        expect(tokenIdSchema.safeParse("-1").success).toBe(false);
        expect(tokenIdSchema.safeParse("1/transfers").success).toBe(false);
    });

    it("rejects coin IDs that could change the request path", () => {
        expect(coinIdSchema.safeParse("wrapped-bitcoin").success).toBe(true);
        expect(coinIdSchema.safeParse("../global").success).toBe(false);
    });

    it("maps chart intervals to CoinGecko queries", () => {
        expect(intervalSchema.parse(undefined)).toBe("30");
        expect(marketChartQuery("24")).toBe("vs_currency=usd&days=2");
        expect(marketChartQuery("7")).toBe("vs_currency=usd&days=7&interval=daily");
    });
});
