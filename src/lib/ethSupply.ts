import { unstable_cache } from "next/cache";
import { rpcClient } from "./providers/rpc";
import { getTopMarkets } from "./providers/coingecko";
import { getValidatorQueue } from "./validators";
import { bucket, burnOf, getRecentFeeBlocks, maxBlobGasPerBlock, type FeeBlock } from "./feeHistory";
import type { PublicClient } from "viem";
import type { Section } from "./defi";

// ETH supply: how much ETH was burnt over the last ~24 hours (measured from blocks) against how
// much was issued to stakers (estimated from the amount staked), plus the circulating supply.

export const BLOCKS_PER_HOUR = 300;               // 12-second slots
export const DAY_BLOCKS = 24 * BLOCKS_PER_HOUR;   // 7,200
export const STAKED_ETH_PER_VALIDATOR = 32;

// Yearly issuance to stakers is about 2.6 x 64 x sqrt(total staked ETH) when validators perform well
// (the base reward scales with 1/sqrt of the total stake). Missed duties make real issuance a bit lower.
export function estimateYearlyIssuance(stakedEth: number): number {
    return 166.3 * Math.sqrt(stakedEth);
}

export interface SupplySummary {
    windowBlocks: number;
    windowHours: number;
    burnEth: number;
    blobBurnEth: number;
    issuanceEth: number | null;
    netEth: number | null;          // issuance - burn: negative means supply shrank
    stakedEth: number | null;
    supply: number | null;
    yearlyNetPercent: number | null;
    baseFeeGwei: number;
    hourly: { hoursAgo: number; burnEth: number }[];
}

export function summarizeSupply(blocks: FeeBlock[], gasLimit: number, maxBlobGas: number | null, stakedEth: number | null, supply: number | null): SupplySummary {
    const burn = burnOf(blocks, gasLimit, maxBlobGas);
    const windowHours = blocks.length / BLOCKS_PER_HOUR;
    const issuanceEth = stakedEth ? estimateYearlyIssuance(stakedEth) / 365 / 24 * windowHours : null;
    const netEth = issuanceEth === null ? null : issuanceEth - burn.totalEth;
    const hourlyRaw = bucket(blocks, BLOCKS_PER_HOUR, chunk => burnOf(chunk, gasLimit, maxBlobGas).totalEth);
    const last = blocks[blocks.length - 1];
    return {
        windowBlocks: blocks.length,
        windowHours,
        burnEth: burn.totalEth,
        blobBurnEth: burn.blobEth,
        issuanceEth,
        netEth,
        stakedEth,
        supply,
        yearlyNetPercent: netEth !== null && supply ? (netEth / windowHours * 24 * 365) / supply * 100 : null,
        baseFeeGwei: last ? Number(last.baseFee) / 1e9 : 0,
        hourly: hourlyRaw.map((burnEth, i) => ({ hoursAgo: hourlyRaw.length - i, burnEth }))
    };
}

export async function stakedEth(): Promise<number | null> {
    try {
        const queue = await getValidatorQueue();
        return queue.information.data.validatorscount * STAKED_ETH_PER_VALIDATOR;
    }
    catch {
        return null;
    }
}

export async function circulatingSupply(): Promise<number | null> {
    try {
        const eth = (await getTopMarkets()).find(c => c.id === 'ethereum');
        return eth?.circulating_supply ?? null;
    }
    catch {
        return null;
    }
}

export async function computeSupply(client: Pick<PublicClient, 'request' | 'getBlock'>): Promise<SupplySummary> {
    const [blocks, latest, staked, supply] = await Promise.all([
        getRecentFeeBlocks(client, DAY_BLOCKS),
        client.getBlock(),
        stakedEth(),
        circulatingSupply()
    ]);
    const maxBlobGas = await maxBlobGasPerBlock(client, blocks).catch(() => null);
    return summarizeSupply(blocks, Number(latest.gasLimit), maxBlobGas, staked, supply);
}

// Cached for 10 minutes (one refresh costs about 10 RPC calls). Failures aren't cached.
const cachedSupply = unstable_cache(() => computeSupply(rpcClient as unknown as PublicClient), ['eth-supply'], { revalidate: 600 });

export async function getEthSupply(): Promise<Section<SupplySummary>> {
    try {
        return { data: await cachedSupply() };
    }
    catch {
        return { error: 'The Ethereum node is unavailable right now' };
    }
}
