import { providerFetch } from "./http";

// Standard Ethereum Beacon API (https://ethereum.github.io/beacon-APIs/) served by a free public node.
// Set BEACON_API_URL to your own or another provider's beacon node to change it.
const BEACON_URL = process.env.BEACON_API_URL || 'https://ethereum-beacon-api.publicnode.com';

// Beacon responses can be several MB, which is over the Next.js data cache item limit,
// so callers cache their computed result at the route level instead.
export function beacon<T>(path: string): Promise<T> {
    return providerFetch<T>('Beacon node', BEACON_URL + path, { revalidate: false, timeoutMs: 30000 });
}
