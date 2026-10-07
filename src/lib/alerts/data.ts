import { getEthPrice } from "../providers/ethPrice";
import { coingecko, CG_CACHE, getTopMarkets, type CoinMarket } from "../providers/coingecko";
import { beacon } from "../providers/beacon";
import { getCollectionStats } from "../providers/opensea";
import { getEnsHoldings } from "../ensHoldings";
import { getActivity, getApprovals, type ActivityItem, type TokenApproval } from "../walletInsights";
import { readLatestBlock } from "../live";
import { rpcClient } from "../providers/rpc";
import { providerFetch } from "../providers/http";
import type { Network } from "../validation";
import type { PublicClient } from "viem";

// Everything the alert checkers read, behind one interface so tests can pass fakes.
// Prices come from the shared top-250 markets query (already cached for the prices pages),
// so price and depeg alerts add no CoinGecko calls against the Demo plan's monthly cap.

export interface ValidatorInfo { index: string; status: string; balanceGwei: number; slashed: boolean }
export interface NewProposal { id: string; space: string; spaceName: string; title: string; created: number; end: number; link: string }

export interface AlertData {
    ethPrice(): Promise<{ usd: number; change24h: number }>;
    markets(): Promise<CoinMarket[]>;
    globalMarket(): Promise<{ marketCapUsd: number; change24h: number; ethDominance: number }>;
    baseFeeGwei(): Promise<number>;
    walletActivity(address: string, chain: string): Promise<ActivityItem[]>;
    approvals(address: string, chain: string): Promise<TokenApproval[]>;
    validators(ids: string[]): Promise<ValidatorInfo[]>;
    nftFloor(slug: string): Promise<{ floor: number; symbol: string }>;
    ensNames(address: string): Promise<{ name: string; expires: string | null }[]>;
    newProposals(spaces: string[], since: number): Promise<NewProposal[]>;
}

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? v as Json : {});

export const liveData: AlertData = {
    async ethPrice() {
        const p = await getEthPrice();
        return { usd: p.usd, change24h: p.usd_24h_change };
    },
    markets: () => getTopMarkets(),
    async globalMarket() {
        const g = obj(obj(await coingecko<unknown>('/global', CG_CACHE.global)).data);
        return {
            marketCapUsd: Number(obj(g.total_market_cap).usd ?? 0),
            change24h: Number(g.market_cap_change_percentage_24h_usd ?? 0),
            ethDominance: Number(obj(g.market_cap_percentage).eth ?? 0)
        };
    },
    async baseFeeGwei() {
        const block = await readLatestBlock(rpcClient as unknown as PublicClient, 'eth');
        return block.baseFeeGwei ?? 0;
    },
    walletActivity: (address, chain) => getActivity(address, chain as Network, 20),
    approvals: (address, chain) => getApprovals(address, chain as Network),
    async validators(ids) {
        if (ids.length === 0) return [];
        const data = await beacon<{ data: { index: string; status: string; balance: string; validator: { slashed: boolean } }[] }>(
            '/eth/v1/beacon/states/head/validators?id=' + ids.map(encodeURIComponent).join(',')
        );
        return data.data.map(v => ({ index: v.index, status: v.status, balanceGwei: Number(v.balance), slashed: !!v.validator?.slashed }));
    },
    async nftFloor(slug) {
        const stats = await getCollectionStats(slug);
        return { floor: stats.total.floor_price, symbol: stats.total.floor_price_symbol || 'ETH' };
    },
    async ensNames(address) {
        return ((await getEnsHoldings(address)) ?? []).map(n => ({ name: n.ens_name, expires: n.expiration_timestamp }));
    },
    async newProposals(spaces, since) {
        if (spaces.length === 0) return [];
        const query = `query New($spaces: [String], $since: Int) {
  proposals(first: 50, where: { space_in: $spaces, created_gt: $since }, orderBy: "created", orderDirection: asc) { id title created end link space { id name } }
}`;
        const data = await providerFetch<unknown>('Snapshot', 'https://hub.snapshot.org/graphql', {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, variables: { spaces, since } }), revalidate: false
        });
        const list = obj(obj(data).data).proposals;
        return (Array.isArray(list) ? list : []).map(raw => {
            const p = obj(raw); const s = obj(p.space);
            const id = String(p.id ?? ''); const space = String(s.id ?? '');
            const link = typeof p.link === 'string' && /^https:\/\/(www\.)?snapshot\.(org|box)\//.test(p.link) ? p.link : `https://snapshot.box/#/s:${space}/proposal/${id}`;
            return { id, space, spaceName: String(s.name || space), title: String(p.title || 'Untitled proposal'), created: Number(p.created), end: Number(p.end), link };
        }).filter(p => p.id && p.space);
    }
};

// Wraps a data source so each value is fetched once per run, however many subscriptions need it
export function memoize(data: AlertData): AlertData {
    const cache = new Map<string, Promise<unknown>>();
    const wrap = <A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) => (...args: A): Promise<R> => {
        const key = name + JSON.stringify(args);
        if (!cache.has(key)) cache.set(key, fn(...args));
        return cache.get(key) as Promise<R>;
    };
    return Object.fromEntries(Object.entries(data).map(([name, fn]) => [name, wrap(name, (fn as (...a: unknown[]) => Promise<unknown>).bind(data))])) as unknown as AlertData;
}
