'use client';

import useSWR from 'swr';
import Link from 'next/link';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import StatTile from './StatTile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { MevSummary } from '@/lib/mev';

const ethValue = (v: number | null, digits = 4) => v === null ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: digits }) + ' ETH';
const short = (key: string) => key.slice(0, 10) + '…' + key.slice(-6);

export default function MevSection() {
    const { data, error, isLoading } = useSWR<{ data: MevSummary } | { error: string }>('/api/mev', GenericFetcher, { revalidateOnFocus: false, refreshInterval: 120000 });

    if (isLoading) return <p className="text-center text-gray-400">Loading relay data…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load MEV data. Please try again later.</p>;
    if ('error' in data) return <p className="text-center text-red-400">{data.error}</p>;

    const s = data.data;
    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Blocks via MEV-Boost" value={s.mevBoostShare === null ? '—' : (s.mevBoostShare * 100).toFixed(0) + '%'} note={s.window ? `${s.mevBoostBlocks} of ${s.window.slots} recent slots` : undefined} />
                <StatTile label="Median payment" value={ethValue(s.medianValueEth)} note="builder → proposer, per block" />
                <StatTile label="Total paid" value={ethValue(s.totalValueEth, 2)} note="over these blocks" />
                <StatTile label="Relays answering" value={`${s.relays.filter(r => r.ok).length} / ${s.relays.length}`} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Panel title="Relays" description="Share of recent MEV-Boost deliveries. A block sent through several relays counts for each.">
                    <Table>
                        <TableHeader><TableRow><TableHead className="text-gray-300">Relay</TableHead><TableHead className="text-gray-300 text-right">Blocks</TableHead><TableHead className="text-gray-300 text-right">Share</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {s.relays.map(r => (
                                <TableRow key={r.name} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200">{r.name}</TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{r.ok ? r.payloads : <span className="text-gray-500">unavailable</span>}</TableCell>
                                    <TableCell className="text-gray-400 text-right tabular-nums">{r.share === null ? '—' : (r.share * 100).toFixed(0) + '%'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>

                <Panel title="Builders" description="Who built the recent MEV-Boost blocks (by builder public key).">
                    <Table>
                        <TableHeader><TableRow><TableHead className="text-gray-300">Builder</TableHead><TableHead className="text-gray-300 text-right">Blocks</TableHead><TableHead className="text-gray-300 text-right">Paid</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {s.builders.map(b => (
                                <TableRow key={b.builder} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200 font-mono text-xs" title={b.builder}>{short(b.builder)}</TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{b.blocks} <span className="text-gray-500">({(b.share * 100).toFixed(0)}%)</span></TableCell>
                                    <TableCell className="text-gray-300 text-right tabular-nums">{ethValue(b.valueEth, 3)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </div>

            <Panel title="Recent MEV-Boost Blocks">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="text-gray-300">Block</TableHead><TableHead className="text-gray-300 text-right">Paid to proposer</TableHead>
                        <TableHead className="text-gray-300 text-right">Transactions</TableHead><TableHead className="text-gray-300">Relays</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {s.recent.map(b => (
                            <TableRow key={b.blockHash} className="border-b border-gray-800">
                                <TableCell><Link href={`/block/${b.blockNumber}`} className="underline text-gray-100 tabular-nums">{b.blockNumber.toLocaleString('en-US')}</Link></TableCell>
                                <TableCell className="text-gray-100 text-right tabular-nums">{ethValue(b.valueEth)}</TableCell>
                                <TableCell className="text-gray-300 text-right tabular-nums">{b.txCount}</TableCell>
                                <TableCell className="text-gray-400">{b.relays.join(', ')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Panel>
            <p className="text-center text-xs text-gray-500">From each relay&apos;s public data API (latest 200 deliveries), compared over the slots all answering relays cover.</p>
        </div>
    );
}
