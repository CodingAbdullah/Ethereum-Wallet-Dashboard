import { describe, expect, it } from "vitest";
import { createMemoryNonceStore } from "./nonce";

describe("memory nonce store", () => {
    it("accepts a nonce once", async () => {
        const store = createMemoryNonceStore();
        const nonce = await store.create();
        expect(nonce).toMatch(/^[a-zA-Z0-9]{8,}$/);
        expect(await store.consume(nonce)).toBe(true);
        expect(await store.consume(nonce)).toBe(false);
    });

    it("rejects unknown and expired nonces", async () => {
        let time = 0;
        const store = createMemoryNonceStore(1000, () => time);
        const nonce = await store.create();
        expect(await store.consume('unknown')).toBe(false);
        time = 1001;
        expect(await store.consume(nonce)).toBe(false);
    });
});
