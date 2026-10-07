import { unstable_cache } from "next/cache";
import { formatGwei } from "viem";
import { rpcClient } from "./providers/rpc";

const BLOCK_COUNT = 20;

// Confidence level -> priority fee percentile across recent blocks
const CONFIDENCE_PERCENTILES = [
    { confidence: 99, percentile: 90 },
    { confidence: 95, percentile: 75 },
    { confidence: 90, percentile: 60 },
    { confidence: 80, percentile: 50 },
    { confidence: 70, percentile: 25 }
];

const toGwei = (wei: bigint) => Number(Number(formatGwei(wei)).toFixed(3));

function median(values: bigint[]): bigint {
    const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return sorted[Math.floor(sorted.length / 2)] ?? BigInt(0);
}

// Gas price estimates from eth_feeHistory over free RPC.
// Replaces Blocknative's gas API (shut down June 2026) and keeps its response shape for the gas tables.
export const getGasEstimate = unstable_cache(async () => {
    const [history, block] = await Promise.all([
        rpcClient.getFeeHistory({ blockCount: BLOCK_COUNT, rewardPercentiles: CONFIDENCE_PERCENTILES.map(c => c.percentile), blockTag: 'latest' }),
        rpcClient.getBlock({ blockTag: 'latest' })
    ]);

    // feeHistory returns one extra base fee: the next block's
    const nextBaseFee = history.baseFeePerGas[history.baseFeePerGas.length - 1];

    const estimatedPrices = CONFIDENCE_PERCENTILES.map(({ confidence }, index) => {
        const priorityFee = median((history.reward ?? []).map(rewards => rewards[index]));
        return {
            confidence,
            price: toGwei(nextBaseFee + priorityFee),
            maxPriorityFeePerGas: toGwei(priorityFee),
            maxFeePerGas: toGwei(nextBaseFee * BigInt(2) + priorityFee)
        };
    });

    return {
        system: 'ethereum',
        network: 'main',
        unit: 'gwei',
        maxPrice: estimatedPrices[0].price,
        currentBlockNumber: Number(block.number),
        msSinceLastBlock: Math.max(0, Date.now() - Number(block.timestamp) * 1000),
        blockPrices: [{
            blockNumber: Number(block.number) + 1,
            baseFeePerGas: toGwei(nextBaseFee),
            estimatedPrices
        }]
    };
}, ['gas-estimate'], { revalidate: 12 }); // Roughly one block
