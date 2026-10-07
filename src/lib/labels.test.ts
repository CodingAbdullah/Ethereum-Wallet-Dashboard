import { describe, expect, it } from "vitest";
import { isAddress } from "viem";
import { labelFor } from "./labels";

describe("labelFor", () => {
    it("finds labels regardless of address case", () => {
        expect(labelFor('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toEqual({ name: 'USDC', kind: 'token' });
        expect(labelFor('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')?.name).toBe('USDC');
        expect(labelFor('0x0000000000000000000000000000000000000001')).toBeNull();
        expect(labelFor(null)).toBeNull();
    });

    it("only contains valid lowercase addresses", async () => {
        const source = (await import("node:fs")).readFileSync(new URL('./labels.ts', import.meta.url), 'utf8');
        const keys = [...source.matchAll(/'(0x[0-9a-fA-F]+)':/g)].map(m => m[1]);
        expect(keys.length).toBeGreaterThan(20);
        for (const key of keys) {
            expect(isAddress(key, { strict: false }), key).toBe(true);
            expect(key, 'keys must be lowercase').toBe(key.toLowerCase());
        }
        expect(new Set(keys).size).toBe(keys.length);
    });
});
