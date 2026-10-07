import { providerFetch } from "./http";
import type { Network } from "../validation";
import { CHAINS } from "../chains";

// Moralis Data API on the free plan (40,000 compute units per day)
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2';

// Moralis chain identifiers come from the chain registry (src/lib/chains.ts)
export function moralisChain(network: Network): string {
    return CHAINS[network].moralis;
}

export function moralis<T>(path: string, revalidate: number = 120): Promise<T> {
    return providerFetch<T>('Moralis', MORALIS_URL + path, {
        headers: { 'X-API-KEY': process.env.MORALIS_API_KEY },
        revalidate
    });
}
