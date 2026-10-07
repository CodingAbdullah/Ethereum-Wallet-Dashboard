'use client';

import useSWR from 'swr';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import ValueLineChart, { usdCompact } from './ValueLineChart';
import { StageBadge } from './L2OverviewSection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ChainDetail } from '@/lib/l2';

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
            <p className="text-sm text-gray-400">{label}</p>
            <div className="text-2xl font-bold text-gray-100 tabular-nums">{children}</div>
        </div>
    );
}

export default function ChainDetailSection({ chainKey }: { chainKey: string }) {
    const { data, error, isLoading } = useSWR<ChainDetail>('/api/l2/' + chainKey, GenericFetcher, { revalidateOnFocus: false, refreshInterval: 30000 });

    if (isLoading) return <p className="text-center text-gray-400">Loading…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load this network. Please try again later.</p>;

    const { chain, tvl, history, protocols, live, l2beat } = data;

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="DeFi TVL">{tvl ? usdCompact(tvl.tvl) : '—'}{tvl && <span className="block text-sm font-normal text-gray-400">{(tvl.share * 100).toFixed(1)}% of all chains</span>}</Stat>
                <Stat label="Latest block">{'data' in live ? live.data.block.toLocaleString('en-US') : '—'}</Stat>
                <Stat label="Gas price">{'data' in live ? (live.data.gasGwei < 0.01 ? live.data.gasGwei.toPrecision(2) : live.data.gasGwei.toFixed(2)) + ' gwei' : '—'}</Stat>
                <Stat label={chain.layer2 ? 'L2BEAT stage' : 'Type'}>
                    {chain.layer2 ? <StageBadge stage={l2beat?.stage ?? null} /> : <span className="text-lg">Sidechain</span>}
                    {l2beat?.category && <span className="block text-sm font-normal text-gray-400 mt-1">{l2beat.category}</span>}
                </Stat>
            </div>

            <Panel title="Value Locked" description={`DeFi on ${chain.name}, last 12 months.`}>
                {'error' in history ? <p className="text-gray-500">{history.error}</p>
                    : history.data.length < 2 ? <p className="text-gray-500">Not enough data yet.</p>
                    : <ValueLineChart data={history.data} dataKey="tvl" label="TVL" height="h-72" compactTooltip />}
            </Panel>

            <Panel title="Top Protocols" description={`Largest DeFi protocols on ${chain.name} by value locked.`}>
                {'error' in protocols ? <p className="text-gray-500">{protocols.error}</p> : protocols.data.length === 0 ? <p className="text-gray-500">No protocols found.</p> : (
                    <Table>
                        <TableHeader><TableRow><TableHead className="text-gray-300">Protocol</TableHead><TableHead className="text-gray-300">Category</TableHead><TableHead className="text-gray-300 text-right">TVL</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {protocols.data.map(p => (
                                <TableRow key={p.name} className="border-b border-gray-800">
                                    <TableCell className="text-gray-100 font-medium">{p.name}</TableCell>
                                    <TableCell className="text-gray-400">{p.category}</TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{usdCompact(p.tvl)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Panel>

            <p className="text-center text-sm text-gray-400">
                Chain ID {chain.chainId} · Gas paid in {chain.native} ·{' '}
                <a href={chain.explorer} target="_blank" rel="noopener noreferrer" className="underline">Block explorer</a>
                {chain.website && <> · <a href={chain.website} target="_blank" rel="noopener noreferrer" className="underline">Official site</a></>}
            </p>
            <p className="text-center text-xs text-gray-500">Wallet holdings, NFTs and your portfolio on /me also work on {chain.name}: pick it in the network selector.</p>
        </div>
    );
}
