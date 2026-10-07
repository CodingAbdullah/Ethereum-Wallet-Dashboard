import { describe, expect, it, vi } from "vitest";
import { parseGwei } from "viem";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
vi.mock("@/lib/providers/rpc", () => ({
    rpcClient: {
        // Three blocks of priority-fee percentiles [90th, 75th, 60th, 50th, 25th]; the last base fee is the next block's
        getFeeHistory: vi.fn(async () => ({
            baseFeePerGas: [parseGwei("1"), parseGwei("1"), parseGwei("1"), parseGwei("2")],
            reward: [
                [parseGwei("3"), parseGwei("2"), parseGwei("1"), parseGwei("0.5"), parseGwei("0.1")],
                [parseGwei("5"), parseGwei("2"), parseGwei("1"), parseGwei("0.5"), parseGwei("0.1")],
                [parseGwei("4"), parseGwei("2"), parseGwei("1"), parseGwei("0.5"), parseGwei("0.1")]
            ]
        })),
        getBlock: vi.fn(async () => ({ number: BigInt(23000000), timestamp: BigInt(Math.floor(Date.now() / 1000)) }))
    }
}));

const { GET } = await import("./route");

describe("GET /api/navbar/gas-track", () => {
    it("builds Blocknative-shaped estimates from fee history", async () => {
        const data = await (await GET()).json();

        expect(data).toMatchObject({ system: "ethereum", network: "main", unit: "gwei", currentBlockNumber: 23000000 });
        expect(data.blockPrices[0].baseFeePerGas).toBe(2);

        // 99% confidence uses the median 90th-percentile tip (4 gwei) on top of the next base fee (2 gwei)
        expect(data.blockPrices[0].estimatedPrices[0]).toEqual({ confidence: 99, price: 6, maxPriorityFeePerGas: 4, maxFeePerGas: 8 });
        expect(data.maxPrice).toBe(6);
        expect(data.blockPrices[0].estimatedPrices.map((estimate: { confidence: number }) => estimate.confidence)).toEqual([99, 95, 90, 80, 70]);
    });
});
