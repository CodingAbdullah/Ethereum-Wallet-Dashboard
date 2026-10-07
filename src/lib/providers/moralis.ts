import { providerFetch } from "./http";
import type { Network } from "../validation";

// Moralis Data API on the free plan (40,000 compute units per day)
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2';

// Moralis chain identifiers for the networks the dashboard supports
const MORALIS_CHAIN: Record<Network, string> = {
    eth: 'eth',
    sepolia: 'sepolia',
    hoodi: '0x88bb0'
};

export function moralisChain(network: Network): string {
    return MORALIS_CHAIN[network];
}

export function moralis<T>(path: string, revalidate: number = 120): Promise<T> {
    return providerFetch<T>('Moralis', MORALIS_URL + path, {
        headers: { 'X-API-KEY': process.env.MORALIS_API_KEY },
        revalidate
    });
}
