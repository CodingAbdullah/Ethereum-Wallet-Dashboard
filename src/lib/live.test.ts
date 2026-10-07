import { describe, expect, it } from "vitest";
import type { PublicClient } from "viem";
import { readLatestBlock, sharedLatestBlock, sseEvent } from "./live";

const fakeClient = (number: number) => {
    let calls = 0;
    const client = {
        getBlock: async () => { calls++; return { number: BigInt(number), timestamp: BigInt(1700000000), baseFeePerGas: BigInt(2_500_000_000), gasUsed: BigInt(15e6), gasLimit: BigInt(30e6), transactions: ['0x1', '0x2'] }; }
    } as unknown as PublicClient;
    return { client, calls: () => calls };
};

describe("live block", () => {
    it("reads the latest block", async () => {
        expect(await readLatestBlock(fakeClient(100).client, 'eth')).toEqual({ chain: 'eth', number: 100, timestamp: 1700000000, baseFeeGwei: 2.5, gasUsedPercent: 50, txCount: 2 });
    });

    it("shares one reading per chain for a few seconds", async () => {
        const fake = fakeClient(200);
        await sharedLatestBlock('base', 1_000_000, fake.client);
        await sharedLatestBlock('base', 1_001_000, fake.client);
        expect(fake.calls()).toBe(1);
        await sharedLatestBlock('base', 1_004_000, fake.client);
        expect(fake.calls()).toBe(2);
    });

    it("doesn't keep a failed reading", async () => {
        const failing = { getBlock: async () => { throw new Error('down'); } } as unknown as PublicClient;
        await expect(sharedLatestBlock('linea', 5_000_000, failing)).rejects.toThrow('down');
        await new Promise(r => setTimeout(r, 0));
        const fake = fakeClient(7);
        expect((await sharedLatestBlock('linea', 5_000_500, fake.client)).number).toBe(7);
    });

    it("formats Server-Sent Events", () => {
        expect(sseEvent('block', { n: 1 })).toBe('event: block\ndata: {"n":1}\n\n');
    });
});
