import { unstable_cache } from "next/cache";
import { getAddress, type PublicClient } from "viem";
import { rpcClient } from "./providers/rpc";
import { BLOB_GAS_PER_BLOB, bucket, burnOf, getRecentFeeBlocks, maxBlobGasPerBlock, type FeeBlock } from "./feeHistory";
import { BLOCKS_PER_HOUR, DAY_BLOCKS } from "./ethSupply";
import { labelFor } from "./labels";
import type { Section } from "./defi";

// Blob (EIP-4844) usage on Ethereum over the last ~24 hours, from fee history, plus who posted the
// blobs in the latest blocks (rollup batch posters, named where the address is in src/lib/labels.ts).

export const POSTER_SCAN_BLOCKS = 20;

export interface BlobPoster { address: string; name: string | null; blobs: number; transactions: number }

export interface BlobSummary {
    maxBlobsPerBlock: number | null;
    blobsPosted: number | null;          // over the window
    averageUsagePercent: number;         // blob gas used vs the per-block maximum
    blobFeesEth: number | null;
    blobBaseFeeGwei: number;
    hourly: { hoursAgo: number; usagePercent: number; blobBaseFeeGwei: number }[];
    posters: BlobPoster[];
    posterBlocks: number;
}

export function summarizeBlobs(blocks: FeeBlock[], maxBlobGas: number | null, posters: BlobPoster[], posterBlocks: number): BlobSummary {
    const maxBlobs = maxBlobGas ? maxBlobGas / BLOB_GAS_PER_BLOB : null;
    const avgRatio = blocks.length ? blocks.reduce((sum, b) => sum + b.blobRatio, 0) / blocks.length : 0;
    const hourly = bucket(blocks, BLOCKS_PER_HOUR, chunk => ({
        usagePercent: chunk.reduce((s, b) => s + b.blobRatio, 0) / chunk.length * 100,
        blobBaseFeeGwei: chunk.reduce((s, b) => s + Number(b.blobBaseFee), 0) / chunk.length / 1e9
    }));
    const last = blocks[blocks.length - 1];
    return {
        maxBlobsPerBlock: maxBlobs,
        blobsPosted: maxBlobs === null ? null : Math.round(blocks.reduce((sum, b) => sum + b.blobRatio * maxBlobs, 0)),
        averageUsagePercent: avgRatio * 100,
        blobFeesEth: maxBlobGas ? burnOf(blocks, 0, maxBlobGas).blobEth : null,
        blobBaseFeeGwei: last ? Number(last.blobBaseFee) / 1e9 : 0,
        hourly: hourly.map((h, i) => ({ hoursAgo: hourly.length - i, ...h })),
        posters,
        posterBlocks
    };
}

type BlockTx = { type?: string; from: string; blobVersionedHashes?: readonly string[] };

// Groups the blob transactions in the given blocks by sender
export function tallyPosters(blocks: { transactions: readonly unknown[] }[]): BlobPoster[] {
    const bySender = new Map<string, BlobPoster>();
    for (const block of blocks) {
        for (const raw of block.transactions) {
            const tx = raw as BlockTx;
            const blobs = tx.blobVersionedHashes?.length ?? 0;
            if (tx.type !== 'eip4844' || blobs === 0) continue;
            const address = getAddress(tx.from);
            const entry = bySender.get(address) ?? { address, name: labelFor(address)?.name ?? null, blobs: 0, transactions: 0 };
            entry.blobs += blobs;
            entry.transactions += 1;
            bySender.set(address, entry);
        }
    }
    return [...bySender.values()].sort((a, b) => b.blobs - a.blobs);
}

export async function computeBlobs(client: Pick<PublicClient, 'request' | 'getBlock'>): Promise<BlobSummary> {
    const blocks = await getRecentFeeBlocks(client, DAY_BLOCKS);
    const latest = blocks[blocks.length - 1]?.number ?? 0;
    const [maxBlobGas, recent] = await Promise.all([
        maxBlobGasPerBlock(client, blocks).catch(() => null),
        Promise.all(Array.from({ length: POSTER_SCAN_BLOCKS }, (_, i) =>
            client.getBlock({ blockNumber: BigInt(latest - i), includeTransactions: true }).catch(() => null)))
    ]);
    const scanned = recent.filter(b => b !== null);
    return summarizeBlobs(blocks, maxBlobGas, tallyPosters(scanned), scanned.length);
}

const cachedBlobs = unstable_cache(() => computeBlobs(rpcClient as unknown as PublicClient), ['blobs'], { revalidate: 600 });

export async function getBlobs(): Promise<Section<BlobSummary>> {
    try {
        return { data: await cachedBlobs() };
    }
    catch {
        return { error: 'The Ethereum node is unavailable right now' };
    }
}
