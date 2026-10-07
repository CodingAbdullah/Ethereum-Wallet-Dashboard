import type { PublicClient } from "viem";
import { chainInfo } from "./chains";
import { rpcClientFor } from "./providers/rpc";

// Latest block for the live ticker. Every open stream on a server instance shares one reading,
// refreshed at most every few seconds, so many viewers don't multiply RPC calls.

export interface LiveBlock {
    chain: string;
    number: number;
    timestamp: number;
    baseFeeGwei: number | null;
    gasUsedPercent: number;
    txCount: number;
}

export const LIVE_REFRESH_MS = 3000;

type Client = Pick<PublicClient, 'getBlock'>;

export async function readLatestBlock(client: Client, chain: string): Promise<LiveBlock> {
    const block = await client.getBlock();
    return {
        chain,
        number: Number(block.number),
        timestamp: Number(block.timestamp),
        baseFeeGwei: block.baseFeePerGas == null ? null : Number(block.baseFeePerGas) / 1e9,
        gasUsedPercent: block.gasLimit > BigInt(0) ? Number(block.gasUsed * BigInt(10000) / block.gasLimit) / 100 : 0,
        txCount: block.transactions.length
    };
}

const latest = new Map<string, { at: number; value: Promise<LiveBlock> }>();

export function sharedLatestBlock(chain: string, now = Date.now(), client: Client = rpcClientFor(chainInfo(chain).chainId)): Promise<LiveBlock> {
    const cached = latest.get(chain);
    if (cached && now - cached.at < LIVE_REFRESH_MS) return cached.value;
    const value = readLatestBlock(client, chain);
    latest.set(chain, { at: now, value });
    // Don't keep a failed read around
    value.catch(() => { if (latest.get(chain)?.value === value) latest.delete(chain); });
    return value;
}

// Server-Sent Events formatting
export const sseEvent = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
