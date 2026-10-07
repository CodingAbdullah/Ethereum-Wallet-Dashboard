import { providerFetch, ProviderError } from "./http";
import { chainInfo } from "../chains";

// OpenSea API v2 with a free API key (https://docs.opensea.io/reference/api-keys)
const OPENSEA_URL = 'https://api.opensea.io/api/v2';

export function opensea<T>(path: string, revalidate: number = 300): Promise<T> {
    return providerFetch<T>('OpenSea', OPENSEA_URL + path, {
        headers: { 'x-api-key': process.env.OPENSEA_API_KEY },
        revalidate
    });
}

// OpenSea chain slug, or null where OpenSea doesn't index the chain (testnets, Linea)
export function openseaChain(network: string): string | null {
    return chainInfo(network).opensea;
}

// Resolves an NFT contract to its OpenSea collection slug (cached for a day)
export async function getCollectionSlug(address: string, network: string = 'eth'): Promise<string> {
    const chain = openseaChain(network);
    if (!chain) throw new ProviderError('OpenSea', 404, 'OpenSea does not index this network');
    const contract = await opensea<{ collection: string }>('/chain/' + chain + '/contract/' + address, 86400);
    return contract.collection;
}

export interface OpenSeaCollectionStats {
    total: {
        volume: number;
        sales: number;
        average_price: number;
        num_owners: number;
        market_cap: number;
        floor_price: number;
        floor_price_symbol: string;
    };
    intervals: {
        interval: 'one_day' | 'seven_day' | 'thirty_day';
        volume: number;
        volume_diff: number;
        volume_change: number;
        sales: number;
        sales_diff: number;
        average_price: number;
    }[];
}

export function getCollectionStats(slug: string): Promise<OpenSeaCollectionStats> {
    return opensea<OpenSeaCollectionStats>('/collections/' + slug + '/stats', 600);
}

// Trait counts for a collection: { counts: { [trait_type]: { [value]: count } } }
export function getCollectionTraits(slug: string): Promise<{ counts: Record<string, Record<string, number>> }> {
    return opensea('/traits/' + slug, 3600);
}
