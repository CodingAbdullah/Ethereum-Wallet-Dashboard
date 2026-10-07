import { unstable_cache } from "next/cache";
import { providerFetch } from "./providers/http";

// MEV-Boost data from the public relay data API every relay exposes
// (GET /relay/v1/data/bidtraces/proposer_payload_delivered). Each relay returns its latest
// delivered payloads; we compare relays over the slots they all cover.

export const RELAYS = [
    { name: 'Flashbots', url: 'https://boost-relay.flashbots.net' },
    { name: 'Ultra Sound', url: 'https://relay.ultrasound.money' },
    { name: 'Agnostic', url: 'https://agnostic-relay.net' },
    { name: 'Titan', url: 'https://titanrelay.xyz' },
    { name: 'Aestus', url: 'https://aestus.live' }
] as const;

export interface Payload {
    slot: number;
    blockNumber: number;
    blockHash: string;
    builder: string;
    valueEth: number;       // paid to the proposer
    txCount: number;
    gasUsed: number;
}

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

export function toPayloads(data: unknown): Payload[] {
    return (Array.isArray(data) ? data : []).map(raw => {
        const p = obj(raw);
        return {
            slot: num(p.slot) ?? 0,
            blockNumber: num(p.block_number) ?? 0,
            blockHash: typeof p.block_hash === 'string' ? p.block_hash : '',
            builder: typeof p.builder_pubkey === 'string' ? p.builder_pubkey : '',
            valueEth: (num(p.value) ?? 0) / 1e18,
            txCount: num(p.num_tx) ?? 0,
            gasUsed: num(p.gas_used) ?? 0
        };
    }).filter(p => p.slot > 0 && p.blockHash);
}

export interface RelayStat { name: string; ok: boolean; payloads: number; share: number | null }
export interface BuilderStat { builder: string; blocks: number; share: number; valueEth: number }

export interface MevSummary {
    window: { fromSlot: number; toSlot: number; slots: number } | null;
    mevBoostBlocks: number;
    mevBoostShare: number | null;    // MEV-Boost blocks / slots in the window (missed slots make this a slight underestimate)
    medianValueEth: number | null;
    totalValueEth: number;
    relays: RelayStat[];
    builders: BuilderStat[];
    recent: (Payload & { relays: string[] })[];
}

export function summarizeMev(results: { name: string; payloads: Payload[] | null }[]): MevSummary {
    const answered = results.filter(r => r.payloads && r.payloads.length > 0);
    // Compare relays only over the slots every answering relay covers
    const fromSlot = answered.length ? Math.max(...answered.map(r => Math.min(...r.payloads!.map(p => p.slot)))) : 0;
    const toSlot = answered.length ? Math.max(...answered.flatMap(r => r.payloads!.map(p => p.slot))) : 0;

    const byHash = new Map<string, Payload & { relays: string[] }>();
    const relayCounts = new Map<string, number>();
    for (const r of answered) {
        for (const p of r.payloads!) {
            if (p.slot < fromSlot) continue;
            relayCounts.set(r.name, (relayCounts.get(r.name) ?? 0) + 1);
            const entry = byHash.get(p.blockHash) ?? { ...p, relays: [] };
            entry.relays.push(r.name);
            byHash.set(p.blockHash, entry);
        }
    }
    const blocks = [...byHash.values()].sort((a, b) => b.slot - a.slot);
    const deliveries = [...relayCounts.values()].reduce((s, n) => s + n, 0);

    const builders = new Map<string, BuilderStat>();
    for (const b of blocks) {
        const entry = builders.get(b.builder) ?? { builder: b.builder, blocks: 0, share: 0, valueEth: 0 };
        entry.blocks += 1;
        entry.valueEth += b.valueEth;
        builders.set(b.builder, entry);
    }
    const values = blocks.map(b => b.valueEth).sort((a, b) => a - b);
    const slots = answered.length ? toSlot - fromSlot + 1 : 0;

    return {
        window: answered.length ? { fromSlot, toSlot, slots } : null,
        mevBoostBlocks: blocks.length,
        mevBoostShare: slots > 0 ? Math.min(1, blocks.length / slots) : null,
        medianValueEth: values.length ? values[Math.floor(values.length / 2)] : null,
        totalValueEth: values.reduce((s, v) => s + v, 0),
        relays: results.map(r => ({
            name: r.name,
            ok: !!r.payloads,
            payloads: relayCounts.get(r.name) ?? 0,
            share: r.payloads && deliveries > 0 ? (relayCounts.get(r.name) ?? 0) / deliveries : null
        })),
        builders: [...builders.values()].map(b => ({ ...b, share: b.blocks / (blocks.length || 1) })).sort((a, b) => b.blocks - a.blocks).slice(0, 10),
        recent: blocks.slice(0, 15)
    };
}

const fetchRelay = (url: string) => providerFetch<unknown>('MEV relay', url + '/relay/v1/data/bidtraces/proposer_payload_delivered?limit=200', { revalidate: false, timeoutMs: 15000 });

const cachedMev = unstable_cache(async () => {
    const results = await Promise.all(RELAYS.map(async relay => {
        try { return { name: relay.name, payloads: toPayloads(await fetchRelay(relay.url)) }; }
        catch { return { name: relay.name, payloads: null }; }
    }));
    if (results.every(r => !r.payloads)) throw new Error('No relay answered');
    return summarizeMev(results);
}, ['mev'], { revalidate: 300 });

export async function getMev(): Promise<{ data: MevSummary } | { error: string }> {
    try { return { data: await cachedMev() }; }
    catch { return { error: 'MEV relays are unavailable right now' }; }
}
