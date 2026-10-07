'use client';

import useSWR from 'swr';
import Link from 'next/link';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import { usdCompact } from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RiskBadge, riskKey, useTokenRisks } from './TokenRiskBadge';
import { CHAINS } from '@/lib/chains';
import type { DexPools, Pool } from '@/lib/dexPools';
import type { Section } from '@/lib/defi';

const CHAIN_TABS = ['eth', 'base', 'arbitrum', 'optimism', 'polygon', 'linea'] as const;

const usd = (v: number | null) => v === null ? '—' : usdCompact(v);
const price = (v: number | null) => v === null ? '—' : v >= 1 ? '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '$' + v.toPrecision(3);
const age = (iso: string | null) => {
    if (!iso) return '—';
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 1440)}d`;
};

function PoolTable({ section, chain, showAge, risks }: { section: Section<Pool[]>; chain: string; showAge: boolean; risks: ReturnType<typeof useTokenRisks>['data'] }) {
    if ('error' in section) return <p className="text-gray-500">{section.error}</p>;
    if (section.data.length === 0) return <p className="text-gray-500">No pools right now.</p>;
    const q = chain === 'eth' ? '' : '?chain=' + chain;
    return (
        <Table>
            <TableHeader><TableRow>
                <TableHead className="text-gray-300">Pool</TableHead><TableHead className="text-gray-300">DEX</TableHead>
                <TableHead className="text-gray-300 text-right">Price</TableHead><TableHead className="text-gray-300 text-right">24h</TableHead>
                <TableHead className="text-gray-300 text-right">Liquidity</TableHead><TableHead className="text-gray-300 text-right">Volume 24h</TableHead>
                {showAge && <TableHead className="text-gray-300 text-right">Age</TableHead>}
            </TableRow></TableHeader>
            <TableBody>
                {section.data.slice(0, 20).map(p => (
                    <TableRow key={p.address} className="border-b border-gray-800">
                        <TableCell className="text-gray-100">
                            {p.baseToken ? <Link href={`/token/${p.baseToken}${q}`} className="hover:underline">{p.name}</Link> : p.name}
                            <span className="ml-2"><RiskBadge risk={p.baseToken ? risks?.[riskKey(chain, p.baseToken)] : undefined} compact /></span>
                        </TableCell>
                        <TableCell className="text-gray-400 capitalize whitespace-nowrap">{p.dex}</TableCell>
                        <TableCell className="text-gray-200 text-right tabular-nums">{price(p.priceUsd)}</TableCell>
                        <TableCell className={`text-right tabular-nums ${p.change24h === null ? 'text-gray-500' : p.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{p.change24h === null ? '—' : (p.change24h >= 0 ? '+' : '') + p.change24h.toFixed(1) + '%'}</TableCell>
                        <TableCell className="text-gray-200 text-right tabular-nums">{usd(p.liquidityUsd)}</TableCell>
                        <TableCell className="text-gray-300 text-right tabular-nums">{usd(p.volume24hUsd)}</TableCell>
                        {showAge && <TableCell className="text-gray-400 text-right tabular-nums">{age(p.createdAt)}</TableCell>}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function DexPoolsSection({ chain }: { chain: string }) {
    const { data, error, isLoading } = useSWR<DexPools>('/api/dex-pools?chain=' + chain, GenericFetcher, { revalidateOnFocus: false, refreshInterval: 120000 });
    const tokens = data ? [...('data' in data.trending ? data.trending.data : []), ...('data' in data.latest ? data.latest.data : [])].slice(0, 30) : [];
    const { data: risks } = useTokenRisks(tokens.flatMap(p => p.baseToken ? [{ chain, address: p.baseToken }] : []));

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <nav aria-label="Network" className="flex flex-wrap justify-center gap-2">
                {CHAIN_TABS.map(key => (
                    <Link key={key} href={key === 'eth' ? '/dex-pools' : '/dex-pools?chain=' + key} aria-current={key === chain ? 'page' : undefined}
                        className={`rounded-full px-3 py-1 text-sm ring-1 ${key === chain ? 'bg-gray-200 text-gray-900 ring-gray-200' : 'text-gray-300 ring-gray-600 hover:bg-gray-700'}`}>
                        {CHAINS[key].name}
                    </Link>
                ))}
            </nav>
            {isLoading ? <p className="text-center text-gray-400">Loading pools…</p> : error || !data ? <p className="text-center text-red-400">Could not load pools. Please try again later.</p> : (
                <>
                    <Panel title="Trending Pools" description="Where trading is picking up right now.">
                        <PoolTable section={data.trending} chain={chain} showAge={false} risks={risks} />
                    </Panel>
                    <Panel title="New Pools" description="Just created. New tokens are often scams: check the security badge and the token page before trading.">
                        <PoolTable section={data.latest} chain={chain} showAge risks={risks} />
                    </Panel>
                    <p className="text-center text-xs text-gray-500">Pool data from <a href="https://www.geckoterminal.com" target="_blank" rel="noopener noreferrer" className="underline">GeckoTerminal</a>; security badges from GoPlus.</p>
                </>
            )}
        </div>
    );
}
