import { describe, expect, it, vi } from "vitest";
import type { PublicClient } from "viem";
import { burnOf, getRecentFeeBlocks, maxBlobGasPerBlock, toFeeBlocks, type FeeBlock } from "./feeHistory";
import { estimateYearlyIssuance, summarizeSupply } from "./ethSupply";
import { summarizeBlobs, tallyPosters } from "./blobs";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

const gwei = (n: number) => BigInt(Math.round(n * 1e9));
const block = (number: number, baseFeeGwei: number, gasRatio: number, blobBaseFeeGwei = 0, blobRatio = 0): FeeBlock =>
    ({ number, baseFee: gwei(baseFeeGwei), gasRatio, blobBaseFee: gwei(blobBaseFeeGwei), blobRatio });

describe("toFeeBlocks", () => {
    it("maps fee history to blocks and drops the extra next-block entry", () => {
        const blocks = toFeeBlocks({
            oldestBlock: '0x64',
            baseFeePerGas: ['0x3b9aca00', '0x77359400', '0x1'],
            gasUsedRatio: [0.5, 1],
            baseFeePerBlobGas: ['0x1', '0x2', '0x3'],
            blobGasUsedRatio: [0, 0.25]
        });
        expect(blocks).toEqual([
            { number: 100, baseFee: BigInt(1e9), gasRatio: 0.5, blobBaseFee: BigInt(1), blobRatio: 0 },
            { number: 101, baseFee: BigInt(2e9), gasRatio: 1, blobBaseFee: BigInt(2), blobRatio: 0.25 }
        ]);
    });
});

describe("getRecentFeeBlocks / maxBlobGasPerBlock", () => {
    it("requests ranges of at most 1024 blocks ending at the latest block and stitches them in order", async () => {
        const calls: [string, string][] = [];
        const client = {
            getBlock: async (args?: { blockNumber?: bigint }) => args?.blockNumber
                ? { blobGasUsed: BigInt(6 * 131072) }                     // a block using 6 blobs at ratio 0.5 -> max 12
                : { number: BigInt(5000), gasLimit: BigInt(45_000_000) },
            request: async ({ params }: { params: [string, string, number[]] }) => {
                calls.push([params[0], params[1]]);
                const size = Number(params[0]); const end = Number(params[1]);
                return { oldestBlock: '0x' + (end - size + 1).toString(16), baseFeePerGas: Array(size + 1).fill('0x1'), gasUsedRatio: Array(size).fill(0.5), baseFeePerBlobGas: Array(size + 1).fill('0x1'), blobGasUsedRatio: Array(size).fill(0.5) };
            }
        } as unknown as PublicClient;

        const blocks = await getRecentFeeBlocks(client, 2500);
        expect(calls).toEqual([['0x400', '0x1388'], ['0x400', '0xf88'], ['0x1c4', '0xb88']]);
        expect(blocks).toHaveLength(2500);
        expect(blocks[0].number).toBe(2501);
        expect(blocks[blocks.length - 1].number).toBe(5000);
        expect(await maxBlobGasPerBlock(client, blocks)).toBe(12 * 131072);
        expect(await maxBlobGasPerBlock(client, [block(1, 1, 1)])).toBeNull();
    });
});

describe("burn and issuance", () => {
    it("burns base fee x gas used, plus blob fees", () => {
        // 10 gwei x 50% of 30M gas = 0.15 ETH; blob: 1 gwei x 100% of 786432 blob gas = 0.000786432 ETH
        const burn = burnOf([block(1, 10, 0.5, 1, 1)], 30_000_000, 786432);
        expect(burn.executionEth).toBeCloseTo(0.15);
        expect(burn.blobEth).toBeCloseTo(0.000786432);
        expect(burn.totalEth).toBeCloseTo(0.150786432);
    });

    it("estimates issuance from the amount staked", () => {
        // ~34M ETH staked -> roughly 970k ETH a year (about 2,650 a day)
        expect(estimateYearlyIssuance(34_000_000)).toBeCloseTo(969_700, -3);
    });

    it("summarizes a day of blocks: burn, issuance, net change and hourly burn", () => {
        const blocks = Array.from({ length: 7200 }, (_, i) => block(i, 1, 0.5));     // 1 gwei, half full
        const s = summarizeSupply(blocks, 30_000_000, null, 34_000_000, 120_000_000);
        expect(s.windowHours).toBe(24);
        expect(s.burnEth).toBeCloseTo(108);                                           // 7200 x 0.015 ETH
        expect(s.issuanceEth).toBeCloseTo(969_664 / 365, -1);
        expect(s.netEth).toBeCloseTo(s.issuanceEth! - 108);
        expect(s.yearlyNetPercent).toBeCloseTo((s.netEth! * 365) / 120_000_000 * 100);
        expect(s.hourly).toHaveLength(24);
        expect(s.hourly[0]).toEqual({ hoursAgo: 24, burnEth: expect.closeTo(4.5, 5) });
        expect(summarizeSupply(blocks, 30_000_000, null, null, null)).toMatchObject({ issuanceEth: null, netEth: null, yearlyNetPercent: null });
    });
});

describe("blobs", () => {
    it("summarizes usage, blob count, fees and hourly averages", () => {
        const blocks = Array.from({ length: 600 }, (_, i) => block(i, 1, 0.5, 2, i < 300 ? 0.5 : 1));
        const s = summarizeBlobs(blocks, 12 * 131072, [], 0);
        expect(s.maxBlobsPerBlock).toBe(12);
        expect(s.blobsPosted).toBe(300 * 6 + 300 * 12);
        expect(s.averageUsagePercent).toBe(75);
        expect(s.hourly.map(h => h.usagePercent)).toEqual([50, 100]);
        expect(s.blobBaseFeeGwei).toBe(2);
        expect(s.blobFeesEth).toBeCloseTo((300 * 0.5 + 300) * 12 * 131072 * 2e-9);
    });

    it("tallies blob transactions by sender and names known rollups", () => {
        const posters = tallyPosters([
            { transactions: [
                { type: 'eip4844', from: '0x5050f69a9786f081509234f1a7f4684b5e5b76c9', blobVersionedHashes: ['0x1', '0x2', '0x3'] },
                { type: 'eip1559', from: '0x5050f69a9786f081509234f1a7f4684b5e5b76c9' },
                { type: 'eip4844', from: '0x1111111111111111111111111111111111111111', blobVersionedHashes: ['0x1'] }
            ] },
            { transactions: [{ type: 'eip4844', from: '0x5050f69a9786f081509234f1a7f4684b5e5b76c9', blobVersionedHashes: ['0x4'] }] }
        ]);
        expect(posters).toEqual([
            { address: '0x5050F69a9786F081509234F1a7F4684b5E5b76C9', name: 'Base: Batch Sender', blobs: 4, transactions: 2 },
            { address: '0x1111111111111111111111111111111111111111', name: null, blobs: 1, transactions: 1 }
        ]);
    });
});
