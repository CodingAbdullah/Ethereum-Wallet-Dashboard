import { unstable_cache } from "next/cache";
import { defillama } from "./providers/defillama";
import { estimateYearlyIssuance, circulatingSupply, stakedEth } from "./ethSupply";
import type { Section } from "./defi";

// Expanded staking data for /staking:
// - how much ETH is staked, the share of supply, and the base consensus reward rate
// - liquid staking and (liquid) restaking protocols ranked by value locked on Ethereum (DefiLlama)

export interface StakingProtocol {
    name: string;
    category: string;
    tvl: number;           // USD locked on Ethereum (falls back to all chains)
    change7d: number | null;
    url: string | null;
}

export interface StakingSummary {
    stakedEth: number | null;
    validators: number | null;
    supply: number | null;
    stakingRatio: number | null;
    baseApr: number | null;        // consensus-layer rewards only; tips and MEV add a bit more
}

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};
const str = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

export const LIQUID_STAKING = new Set(['Liquid Staking']);
export const RESTAKING = new Set(['Restaking', 'Liquid Restaking']);

// Protocols in the given categories, by value locked on Ethereum
export function toStakingProtocols(data: unknown, categories: Set<string>, top = 15): StakingProtocol[] {
    return (Array.isArray(data) ? data : []).map(raw => {
        const p = obj(raw);
        const onEthereum = num(obj(p.chainTvls).Ethereum);
        return {
            name: str(p.name) ?? '?',
            category: str(p.category) ?? '',
            tvl: onEthereum ?? num(p.tvl) ?? 0,
            change7d: num(p.change_7d),
            url: str(p.url)
        };
    })
        .filter(p => categories.has(p.category) && p.tvl > 0)
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, top);
}

// Base reward rate: yearly issuance divided by the amount staked (about 166.3 / sqrt(staked ETH))
export function baseStakingApr(staked: number): number {
    return estimateYearlyIssuance(staked) / staked * 100;
}

export function summarizeStaking(staked: number | null, supply: number | null): StakingSummary {
    return {
        stakedEth: staked,
        validators: staked === null ? null : Math.round(staked / 32),
        supply,
        stakingRatio: staked !== null && supply ? staked / supply : null,
        baseApr: staked ? baseStakingApr(staked) : null
    };
}

const getProtocols = unstable_cache(async () => {
    const raw = await defillama('api', '/protocols');
    return { liquid: toStakingProtocols(raw, LIQUID_STAKING), restaking: toStakingProtocols(raw, RESTAKING) };
}, ['staking', 'protocols'], { revalidate: 3600 });

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try { return { data: await load() }; }
    catch { return { error: 'Unavailable right now' }; }
}

export async function getStakingOverview() {
    const [staked, supply, protocols] = await Promise.all([stakedEth(), circulatingSupply(), section(getProtocols)]);
    return {
        summary: summarizeStaking(staked, supply),
        liquid: 'data' in protocols ? { data: protocols.data.liquid } : protocols,
        restaking: 'data' in protocols ? { data: protocols.data.restaking } : protocols
    };
}

export type StakingOverview = Awaited<ReturnType<typeof getStakingOverview>>;
