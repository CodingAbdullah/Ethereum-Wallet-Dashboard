import { toHex, type PublicClient } from "viem";

// Recent per-block fee data from eth_feeHistory, including blob fields (viem's getFeeHistory drops those).
// Used by /eth-supply (burn) and /blobs (blob usage and fees).

export interface RawFeeHistory {
    oldestBlock: string;
    baseFeePerGas: string[];
    gasUsedRatio: number[];
    baseFeePerBlobGas?: string[];
    blobGasUsedRatio?: number[];
}

export interface FeeBlock {
    number: number;
    baseFee: bigint;
    gasRatio: number;
    blobBaseFee: bigint;
    blobRatio: number;
}

type Client = Pick<PublicClient, 'request' | 'getBlock'>;

export const MAX_FEE_HISTORY = 1024;      // most nodes cap a single eth_feeHistory call here
export const BLOB_GAS_PER_BLOB = 131072;

// One entry per block; the arrays carry one extra trailing value (the next block's fees), which is dropped
export function toFeeBlocks(raw: RawFeeHistory): FeeBlock[] {
    const oldest = Number(BigInt(raw.oldestBlock));
    return raw.gasUsedRatio.map((gasRatio, i) => ({
        number: oldest + i,
        baseFee: BigInt(raw.baseFeePerGas[i] ?? 0),
        gasRatio,
        blobBaseFee: BigInt(raw.baseFeePerBlobGas?.[i] ?? 0),
        blobRatio: raw.blobGasUsedRatio?.[i] ?? 0
    }));
}

// The last `count` blocks, oldest first, fetched in chunks of up to 1024
export async function getRecentFeeBlocks(client: Client, count: number): Promise<FeeBlock[]> {
    const latest = await client.getBlock();
    const chunks: Promise<FeeBlock[]>[] = [];
    for (let end = Number(latest.number); end > Number(latest.number) - count; end -= MAX_FEE_HISTORY) {
        const size = Math.min(MAX_FEE_HISTORY, end - (Number(latest.number) - count));
        chunks.push(
            (client.request({ method: 'eth_feeHistory', params: [toHex(size), toHex(end), []] } as never) as Promise<RawFeeHistory>).then(toFeeBlocks)
        );
    }
    return (await Promise.all(chunks)).flat().sort((a, b) => a.number - b.number);
}

// Max blob gas per block isn't in fee history, and upgrades keep raising it, so derive it from a block
// that carried blobs: blobGasUsed / blobGasUsedRatio, rounded to whole blobs
export async function maxBlobGasPerBlock(client: Client, blocks: FeeBlock[]): Promise<number | null> {
    const sample = [...blocks].reverse().find(b => b.blobRatio > 0);
    if (!sample) return null;
    const block = await client.getBlock({ blockNumber: BigInt(sample.number) });
    if (!block.blobGasUsed) return null;
    const blobs = Math.round(Number(block.blobGasUsed) / sample.blobRatio / BLOB_GAS_PER_BLOB);
    return blobs > 0 ? blobs * BLOB_GAS_PER_BLOB : null;
}

const WEI = 1e18;

// ETH burnt by EIP-1559 (base fee x gas used) and by blob fees over the given blocks
export function burnOf(blocks: FeeBlock[], gasLimit: number, maxBlobGas: number | null) {
    let executionWei = 0;
    let blobWei = 0;
    for (const b of blocks) {
        executionWei += Number(b.baseFee) * b.gasRatio * gasLimit;
        if (maxBlobGas) blobWei += Number(b.blobBaseFee) * b.blobRatio * maxBlobGas;
    }
    return { executionEth: executionWei / WEI, blobEth: blobWei / WEI, totalEth: (executionWei + blobWei) / WEI };
}

// Splits blocks into equal consecutive buckets (300 blocks is about an hour at 12s slots)
export function bucket<T>(blocks: FeeBlock[], size: number, summarize: (chunk: FeeBlock[]) => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < blocks.length; i += size) result.push(summarize(blocks.slice(i, i + size)));
    return result;
}
