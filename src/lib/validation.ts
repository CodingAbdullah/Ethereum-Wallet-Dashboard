import { z } from "zod";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { CHAIN_KEYS } from "./chains";

// Shared request schemas, validated on the server before any provider is called

export const addressSchema = z.string().trim().refine(value => isAddress(value, { strict: false }), 'Invalid Ethereum address');

// Every supported network (see src/lib/chains.ts)
export const NETWORKS = CHAIN_KEYS;
export const networkSchema = z.enum(NETWORKS).default('eth');
export type Network = z.infer<typeof networkSchema>;

export const tokenIdSchema = z.string().trim().regex(/^\d{1,78}$/, 'Token ID must be a non-negative integer');

// Accepts any name that passes ENS normalization (including emoji and non-Latin names) and ends in .eth
function normalizesToEth(name: string): boolean {
    try {
        return /\.eth$/.test(normalize(name));
    }
    catch {
        return false;
    }
}

export const ensNameSchema = z.string().trim().refine(normalizesToEth, 'Invalid ENS name').transform(name => normalize(name));

export const coinIdSchema = z.string().trim().regex(/^[a-z0-9-]{1,100}$/, 'Invalid coin id');

export const intervalSchema = z.enum(['24', '7', '14', '30']).default('30');

// Maps the UI interval selector to a CoinGecko market_chart query (24 hours uses 2 days of hourly points, trimmed by the caller)
export function marketChartQuery(interval: z.infer<typeof intervalSchema>): string {
    return interval === '24' ? 'vs_currency=usd&days=2' : 'vs_currency=usd&days=' + interval + '&interval=daily';
}

// Common body shapes
export const addressBody = z.object({ address: addressSchema });
export const addressNetworkBody = z.object({ address: addressSchema, network: networkSchema });
export const contractBody = z.object({ contract: addressSchema });
export const tokenLookupBody = z.object({ address: addressSchema, id: tokenIdSchema, network: networkSchema });
