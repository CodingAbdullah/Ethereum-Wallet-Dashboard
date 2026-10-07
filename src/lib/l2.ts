import { unstable_cache } from "next/cache";
import { formatGwei } from "viem";
import { defillama } from "./providers/defillama";
import { providerFetch, ProviderError } from "./providers/http";
import { rpcClientFor } from "./providers/rpc";
import { CHAINS, type ChainInfo } from "./chains";
import { getChains, toTvlHistory, type Section } from "./defi";

// Layer 2 data for /l2 and /l2/[chain]:
// - DefiLlama (keyless): value locked per chain, history and top protocols on each chain
// - L2BEAT (public but unofficial API): rollup type and risk stage. Optional: if its format
//   changes or it's down, those columns are simply left empty
// - each chain's public RPC: latest block and gas price

export interface L2Project {
    key: string;
    name: string;
    defillama: string;
    l2beat: string;           // L2BEAT project slug
    website: string;
    chain: string | null;     // key in CHAINS when the dashboard supports the chain
}

export const L2_PROJECTS: L2Project[] = [
    { key: 'arbitrum', name: 'Arbitrum One', defillama: 'Arbitrum', l2beat: 'arbitrum', website: 'https://arbitrum.io', chain: 'arbitrum' },
    { key: 'base', name: 'Base', defillama: 'Base', l2beat: 'base', website: 'https://base.org', chain: 'base' },
    { key: 'optimism', name: 'OP Mainnet', defillama: 'OP Mainnet', l2beat: 'op-mainnet', website: 'https://optimism.io', chain: 'optimism' },
    { key: 'linea', name: 'Linea', defillama: 'Linea', l2beat: 'linea', website: 'https://linea.build', chain: 'linea' },
    { key: 'zksync', name: 'ZKsync Era', defillama: 'zkSync Era', l2beat: 'zksync-era', website: 'https://zksync.io', chain: null },
    { key: 'scroll', name: 'Scroll', defillama: 'Scroll', l2beat: 'scroll', website: 'https://scroll.io', chain: null },
    { key: 'starknet', name: 'Starknet', defillama: 'Starknet', l2beat: 'starknet', website: 'https://starknet.io', chain: null },
    { key: 'unichain', name: 'Unichain', defillama: 'Unichain', l2beat: 'unichain', website: 'https://unichain.org', chain: null },
    { key: 'blast', name: 'Blast', defillama: 'Blast', l2beat: 'blast', website: 'https://blast.io', chain: null },
    { key: 'mantle', name: 'Mantle', defillama: 'Mantle', l2beat: 'mantle', website: 'https://mantle.xyz', chain: null },
    { key: 'zora', name: 'Zora', defillama: 'Zora', l2beat: 'zora', website: 'https://zora.co', chain: null },
    { key: 'taiko', name: 'Taiko', defillama: 'Taiko', l2beat: 'taiko', website: 'https://taiko.xyz', chain: null },
    { key: 'ink', name: 'Ink', defillama: 'Ink', l2beat: 'ink', website: 'https://inkonchain.com', chain: null },
    { key: 'mode', name: 'Mode', defillama: 'Mode', l2beat: 'mode', website: 'https://mode.network', chain: null }
];

// Chains with their own /l2/[chain] page: every supported mainnet other than Ethereum (Polygon PoS is a sidechain, shown too)
export const CHAIN_PAGES: ChainInfo[] = Object.values(CHAINS).filter(c => !c.testnet && c.key !== 'eth');

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const str = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};
const same = (a: string | null | undefined, b: string | null | undefined) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

export interface L2beatInfo { slug: string | null; name: string; category: string | null; stage: string | null; tvs: number | null }

// L2BEAT's summary endpoint isn't documented, so every field is optional and both
// { data: { projects } } and { projects } layouts (object or array) are accepted
export function toL2beat(data: unknown): L2beatInfo[] {
    const root = obj(data);
    const projects = obj(root.data).projects ?? root.projects;
    const rows = Array.isArray(projects) ? projects : Object.values(obj(projects));
    return rows.map(raw => {
        const p = obj(raw);
        const stage = typeof p.stage === 'string' ? p.stage : str(obj(p.stage).stage);
        const tvs = num(obj(obj(p.tvs).breakdown).total) ?? num(obj(obj(p.tvl).breakdown).total) ?? num(obj(p.tvs).total) ?? num(p.tvs);
        return { slug: str(p.slug) ?? str(p.id), name: str(p.name) ?? '?', category: str(p.category) ?? str(p.type), stage: stage === 'NotApplicable' ? null : stage, tvs };
    }).filter(p => p.name !== '?');
}

function findL2beat(list: L2beatInfo[], project: L2Project): L2beatInfo | null {
    return list.find(p => same(p.slug, project.l2beat)) ?? list.find(p => same(p.name, project.name)) ?? null;
}

export interface ChainProtocol { name: string; category: string; tvl: number }

// Top protocols on each tracked chain, from one fetch of DefiLlama's protocol list (chainTvls per protocol)
export function toChainProtocols(data: unknown, chains: string[], top = 10): Record<string, ChainProtocol[]> {
    const result: Record<string, ChainProtocol[]> = Object.fromEntries(chains.map(c => [c, []]));
    for (const raw of Array.isArray(data) ? data : []) {
        const p = obj(raw);
        const category = str(p.category) ?? 'Other';
        if (category === 'CEX' || category === 'Chain') continue;
        const chainTvls = obj(p.chainTvls);
        for (const chain of chains) {
            // chainTvls holds plain numbers per chain (and "Chain-staking"-style extras, which are skipped)
            const tvl = num(chainTvls[chain]);
            if (tvl && tvl > 0) result[chain].push({ name: str(p.name) ?? '?', category, tvl });
        }
    }
    for (const chain of chains) result[chain] = result[chain].sort((a, b) => b.tvl - a.tvl).slice(0, top);
    return result;
}

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try {
        return { data: await load() };
    }
    catch (err) {
        return { error: err instanceof ProviderError && (err.status === 401 || err.status === 402) ? 'Not available on the free API' : 'Unavailable right now' };
    }
}

const HOUR = 3600;
const TRACKED_CHAINS = [...new Set([...L2_PROJECTS.map(p => p.defillama), ...CHAIN_PAGES.map(c => c.defillama!).filter(Boolean)])];

// Same cached chain list as /defi
const getChainTvl = getChains;
const getL2beat = unstable_cache(async () => toL2beat(await providerFetch('L2BEAT', 'https://l2beat.com/api/scaling/summary', { revalidate: false, timeoutMs: 15000 })), ['l2', 'l2beat'], { revalidate: HOUR });
const getChainProtocols = unstable_cache(async () => toChainProtocols(await defillama('api', '/protocols'), TRACKED_CHAINS), ['l2', 'chain-protocols'], { revalidate: HOUR });
const getChainHistory = (chain: string) => unstable_cache(async () => toTvlHistory(await defillama('api', '/v2/historicalChainTvl/' + encodeURIComponent(chain))), ['l2', 'history', chain], { revalidate: HOUR })();
const getLiveStats = (chainId: number) => unstable_cache(async () => {
    const client = rpcClientFor(chainId);
    const [block, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);
    return { block: Number(block), gasGwei: Number(formatGwei(gasPrice)) };
}, ['l2', 'live', String(chainId)], { revalidate: 30 })();

export interface L2Row {
    key: string;
    name: string;
    website: string;
    chain: string | null;
    tvl: number | null;
    category: string | null;
    stage: string | null;
    tvs: number | null;
}

// Comparison table for /l2, largest first
export async function getL2Overview() {
    const [chains, l2beat] = await Promise.all([section(getChainTvl), section(getL2beat)]);
    const rows: L2Row[] = L2_PROJECTS.map(project => {
        const tvl = 'data' in chains ? chains.data.find(c => same(c.name, project.defillama))?.tvl ?? null : null;
        const beat = 'data' in l2beat ? findL2beat(l2beat.data, project) : null;
        return { key: project.key, name: project.name, website: project.website, chain: project.chain, tvl, category: beat?.category ?? null, stage: beat?.stage ?? null, tvs: beat?.tvs ?? null };
    }).sort((a, b) => (b.tvl ?? -1) - (a.tvl ?? -1));

    const ethereumTvl = 'data' in chains ? chains.data.find(c => c.name === 'Ethereum')?.tvl ?? null : null;
    return {
        rows,
        ethereumTvl,
        sources: { defillama: !('error' in chains), l2beat: !('error' in l2beat) }
    };
}

// Detail for /l2/[chain]
export async function getChainDetail(chain: ChainInfo) {
    const project = L2_PROJECTS.find(p => p.chain === chain.key);
    const [chains, history, protocols, live, l2beat] = await Promise.all([
        section(getChainTvl),
        section(() => getChainHistory(chain.defillama!)),
        section(async () => (await getChainProtocols())[chain.defillama!] ?? []),
        section(() => getLiveStats(chain.chainId)),
        project ? section(getL2beat) : Promise.resolve(null)
    ]);

    const tvl = 'data' in chains ? chains.data.find(c => same(c.name, chain.defillama)) ?? null : null;
    const beat = project && l2beat && 'data' in l2beat ? findL2beat(l2beat.data, project) : null;
    return {
        chain: { key: chain.key, name: chain.name, chainId: chain.chainId, native: chain.native, explorer: chain.explorer, layer2: chain.layer2, website: project?.website ?? null },
        tvl: tvl ? { tvl: tvl.tvl, share: tvl.share } : null,
        history,
        protocols,
        live,
        l2beat: beat ? { category: beat.category, stage: beat.stage, tvs: beat.tvs } : null
    };
}

export type L2Overview = Awaited<ReturnType<typeof getL2Overview>>;
export type ChainDetail = Awaited<ReturnType<typeof getChainDetail>>;
