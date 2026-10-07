import { providerFetch } from "./providers/http";
import type { Section } from "./defi";

// Trending and newly created DEX pools from GeckoTerminal's free public API (keyless, separate
// from the CoinGecko Demo key's monthly cap). JSON:API format, read defensively.

export const GECKO_NETWORKS: Record<string, string> = {
    eth: 'eth', base: 'base', arbitrum: 'arbitrum', optimism: 'optimism', polygon: 'polygon_pos', linea: 'linea'
};

export interface Pool {
    address: string;
    name: string;
    dex: string;
    baseToken: string | null;      // token contract address, for risk checks and links
    priceUsd: number | null;
    liquidityUsd: number | null;
    volume24hUsd: number | null;
    change24h: number | null;
    buys24h: number | null;
    sells24h: number | null;
    createdAt: string | null;
}

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};
const str = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

// Relationship IDs look like "eth_0xabc..." (network prefix, then the address)
const idAddress = (id: string | null) => id?.match(/0x[0-9a-fA-F]{40}$/)?.[0] ?? null;

export function toPools(data: unknown): Pool[] {
    return (Array.isArray(obj(data).data) ? obj(data).data as unknown[] : []).map(raw => {
        const p = obj(raw);
        const a = obj(p.attributes);
        const rel = obj(p.relationships);
        const tx = obj(obj(a.transactions).h24);
        return {
            address: str(a.address) ?? idAddress(str(p.id)) ?? '',
            name: str(a.name) ?? 'Unknown pool',
            dex: (str(obj(obj(rel.dex).data).id) ?? 'unknown').replace(/[-_]/g, ' '),
            baseToken: idAddress(str(obj(obj(rel.base_token).data).id)),
            priceUsd: num(a.base_token_price_usd),
            liquidityUsd: num(a.reserve_in_usd),
            volume24hUsd: num(obj(a.volume_usd).h24),
            change24h: num(obj(a.price_change_percentage).h24),
            buys24h: num(tx.buys),
            sells24h: num(tx.sells),
            createdAt: str(a.pool_created_at)
        };
    }).filter(p => p.address);
}

const fetchPools = async (network: string, kind: 'trending_pools' | 'new_pools') =>
    toPools(await providerFetch('GeckoTerminal', `https://api.geckoterminal.com/api/v2/networks/${network}/${kind}`, {
        headers: { accept: 'application/json;version=20230302' },
        revalidate: kind === 'new_pools' ? 120 : 300
    }));

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try { return { data: await load() }; }
    catch { return { error: 'GeckoTerminal is unavailable right now' }; }
}

export async function getDexPools(chain: string) {
    const network = GECKO_NETWORKS[chain] ?? GECKO_NETWORKS.eth;
    const [trending, latest] = await Promise.all([section(() => fetchPools(network, 'trending_pools')), section(() => fetchPools(network, 'new_pools'))]);
    return { trending, latest };
}

export type DexPools = Awaited<ReturnType<typeof getDexPools>>;
