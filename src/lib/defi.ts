import { unstable_cache } from "next/cache";
import { defillama } from "./providers/defillama";
import { ProviderError } from "./providers/http";

// DeFi overview for /defi from DefiLlama's open API: TVL by chain and protocol, TVL history,
// DEX volume, fees, stablecoin supply and yields. Each section is fetched, trimmed and cached on
// its own (30-60 min), so one failing endpoint only hides its own section.

export type Section<T> = { data: T } | { error: string };

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const str = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

export interface ChainTvl { name: string; tvl: number; share: number; tokenSymbol: string | null }
export interface ProtocolTvl { name: string; slug: string | null; category: string; chains: number; tvl: number; change1d: number | null; change7d: number | null; url: string | null }
export interface VolumeEntry { name: string; total24h: number; change1d: number | null; category: string | null }
export interface VolumeOverview { total24h: number | null; total7d: number | null; change1d: number | null; top: VolumeEntry[] }
export interface Stablecoin { name: string; symbol: string; pegType: string | null; circulating: number; price: number | null; chains: number }
export interface YieldPool { project: string; chain: string; symbol: string; tvl: number; apy: number; apyBase: number | null; apyReward: number | null; stablecoin: boolean }

const TOP = 25;

// Categories that aren't DeFi protocols (centralized exchanges, chains listed as protocols)
const EXCLUDED_CATEGORIES = new Set(['CEX', 'Chain']);

export function toChains(data: unknown): ChainTvl[] {
    const rows = list(data)
        .map(raw => { const c = obj(raw); return { name: str(c.name) ?? '?', tvl: num(c.tvl) ?? 0, tokenSymbol: str(c.tokenSymbol) }; })
        .filter(c => c.tvl > 0)
        .sort((a, b) => b.tvl - a.tvl);
    const total = rows.reduce((sum, c) => sum + c.tvl, 0);
    return rows.map(c => ({ ...c, share: total > 0 ? c.tvl / total : 0 }));
}

export function toProtocols(data: unknown): ProtocolTvl[] {
    return list(data)
        .map(raw => {
            const p = obj(raw);
            return {
                name: str(p.name) ?? '?',
                slug: str(p.slug),
                category: str(p.category) ?? 'Other',
                chains: list(p.chains).length,
                tvl: num(p.tvl) ?? 0,
                change1d: num(p.change_1d),
                change7d: num(p.change_7d),
                url: str(p.url)
            };
        })
        .filter(p => p.tvl > 0 && !EXCLUDED_CATEGORIES.has(p.category))
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, TOP);
}

export function toTvlHistory(data: unknown, days = 365): { day: string; tvl: number }[] {
    const rows = list(data)
        .map(raw => { const r = obj(raw); return { date: num(r.date), tvl: num(r.tvl) }; })
        .filter((r): r is { date: number; tvl: number } => r.date !== null && r.tvl !== null)
        .map(r => ({ day: new Date(r.date * 1000).toISOString().slice(0, 10), tvl: r.tvl }));
    return rows.slice(-days);
}

export function toVolumeOverview(data: unknown): VolumeOverview {
    const d = obj(data);
    return {
        total24h: num(d.total24h),
        total7d: num(d.total7d),
        change1d: num(d.change_1d),
        top: list(d.protocols)
            .map(raw => {
                const p = obj(raw);
                return { name: str(p.displayName) ?? str(p.name) ?? '?', total24h: num(p.total24h) ?? 0, change1d: num(p.change_1d), category: str(p.category) };
            })
            .filter(p => p.total24h > 0)
            .sort((a, b) => b.total24h - a.total24h)
            .slice(0, TOP)
    };
}

export function toStablecoins(data: unknown): { total: number; top: Stablecoin[] } {
    const coins = list(obj(data).peggedAssets)
        .map(raw => {
            const s = obj(raw);
            // circulating is keyed by peg type, e.g. { peggedUSD: 123 }
            const circulating = Object.values(obj(s.circulating)).map(num).find(v => v !== null) ?? 0;
            return { name: str(s.name) ?? '?', symbol: str(s.symbol) ?? '?', pegType: str(s.pegType), circulating, price: num(s.price), chains: list(s.chains).length };
        })
        .filter(s => s.circulating > 0)
        .sort((a, b) => b.circulating - a.circulating);
    // Only USD-pegged coins are summed, so the total is a dollar figure
    const total = coins.filter(c => c.pegType === 'peggedUSD').reduce((sum, c) => sum + c.circulating, 0);
    return { total, top: coins.slice(0, TOP) };
}

// Highest yields on large pools. Tiny pools and extreme APYs are mostly noise or risk, so they're left out.
export function toYields(data: unknown, minTvl = 10_000_000, maxApy = 200): YieldPool[] {
    return list(obj(data).data)
        .map(raw => {
            const p = obj(raw);
            return {
                project: str(p.project) ?? '?',
                chain: str(p.chain) ?? '?',
                symbol: str(p.symbol) ?? '?',
                tvl: num(p.tvlUsd) ?? 0,
                apy: num(p.apy) ?? 0,
                apyBase: num(p.apyBase),
                apyReward: num(p.apyReward),
                stablecoin: p.stablecoin === true
            };
        })
        .filter(p => p.tvl >= minTvl && p.apy > 0 && p.apy <= maxApy)
        .sort((a, b) => b.apy - a.apy)
        .slice(0, TOP);
}

function sectionError(err: unknown): string {
    // 401/402 mean the endpoint moved to DefiLlama's paid plan; anything else is an outage or a block
    if (err instanceof ProviderError && (err.status === 401 || err.status === 402)) return 'Not available on DefiLlama\'s free API';
    return 'DefiLlama is unavailable right now';
}

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try {
        return { data: await load() };
    }
    catch (err) {
        return { error: sectionError(err) };
    }
}

const HOUR = 3600;
const cached = <T>(key: string, revalidate: number, load: () => Promise<T>) => unstable_cache(load, ['defi', key], { revalidate });

export const getChains = cached('chains', HOUR / 2, async () => toChains(await defillama('api', '/v2/chains')));
const getProtocols = cached('protocols', HOUR / 2, async () => toProtocols(await defillama('api', '/protocols')));
const getTvlHistory = cached('tvl-history', HOUR, async () => toTvlHistory(await defillama('api', '/v2/historicalChainTvl')));
export const getDexVolume = cached('dexs', HOUR / 2, async () => toVolumeOverview(await defillama('api', '/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true')));
const getFees = cached('fees', HOUR / 2, async () => toVolumeOverview(await defillama('api', '/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyFees')));
export const getStablecoins = cached('stablecoins', HOUR, async () => toStablecoins(await defillama('stablecoins', '/stablecoins?includePrices=true')));
const getYields = cached('yields', HOUR, async () => toYields(await defillama('yields', '/pools')));

export async function getDefiOverview() {
    const [chains, protocols, tvlHistory, dexs, fees, stablecoins, yields] = await Promise.all([
        section(getChains), section(getProtocols), section(getTvlHistory), section(getDexVolume),
        section(getFees), section(getStablecoins), section(getYields)
    ]);
    return { chains, protocols, tvlHistory, dexs, fees, stablecoins, yields };
}

export type DefiOverview = Awaited<ReturnType<typeof getDefiOverview>>;
