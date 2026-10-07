'use client';

import useSWR from 'swr';
import Link from 'next/link';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import { usdCompact } from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { L2Overview } from '@/lib/l2';

const right = 'text-right tabular-nums';

// L2BEAT stages: 0 = training wheels, 1 = limited training wheels, 2 = no training wheels
export function StageBadge({ stage }: { stage: string | null }) {
    if (!stage) return <span className="text-gray-500">—</span>;
    return <span className="inline-block rounded border border-gray-600 px-2 py-0.5 text-xs text-gray-200 whitespace-nowrap">{stage}</span>;
}

export default function L2OverviewSection() {
    const { data, error, isLoading } = useSWR<L2Overview>('/api/l2-overview', GenericFetcher, { revalidateOnFocus: false });

    if (isLoading) return <p className="text-center text-gray-400">Loading layer 2 data…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load layer 2 data. Please try again later.</p>;

    const l2Tvl = data.rows.reduce((sum, r) => sum + (r.tvl ?? 0), 0);

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
                    <p className="text-sm text-gray-400">Value locked in DeFi on these L2s</p>
                    <p className="text-3xl font-bold text-gray-100 tabular-nums">{data.sources.defillama ? usdCompact(l2Tvl) : '—'}</p>
                </div>
                <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
                    <p className="text-sm text-gray-400">Value locked in DeFi on Ethereum</p>
                    <p className="text-3xl font-bold text-gray-100 tabular-nums">{data.ethereumTvl === null ? '—' : usdCompact(data.ethereumTvl)}</p>
                </div>
            </div>

            <Panel
                title="Layer 2 Networks"
                description={<>Ranked by value locked in DeFi. <b className="text-gray-300">Stage</b> is L2BEAT&apos;s rating of how decentralized a rollup is, from Stage 0 (operators can still override it) to Stage 2.</>}
            >
                {!data.sources.l2beat && <p className="mb-3 text-sm text-gray-500">Type and stage are unavailable right now (L2BEAT).</p>}
                {!data.sources.defillama && <p className="mb-3 text-sm text-gray-500">Value locked is unavailable right now (DefiLlama).</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Network</TableHead>
                            <TableHead className="text-gray-300">Type</TableHead>
                            <TableHead className="text-gray-300">Stage</TableHead>
                            <TableHead className={`text-gray-300 ${right}`}>DeFi TVL</TableHead>
                            <TableHead className={`text-gray-300 ${right}`}>Total value secured</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.rows.map(row => (
                            <TableRow key={row.key} className="border-b border-gray-800">
                                <TableCell className="text-gray-100 font-medium whitespace-nowrap">
                                    {row.chain
                                        ? <Link href={`/l2/${row.chain}`} className="underline">{row.name}</Link>
                                        : <a href={row.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{row.name}</a>}
                                </TableCell>
                                <TableCell className="text-gray-400 whitespace-nowrap">{row.category ?? '—'}</TableCell>
                                <TableCell><StageBadge stage={row.stage} /></TableCell>
                                <TableCell className={`text-gray-100 ${right}`}>{row.tvl === null ? '—' : usdCompact(row.tvl)}</TableCell>
                                <TableCell className={`text-gray-300 ${right}`}>{row.tvs === null ? '—' : usdCompact(row.tvs)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p className="mt-3 text-xs text-gray-500">
                    Underlined networks have their own page here and work with wallet lookups. DeFi TVL from{' '}
                    <a href="https://defillama.com/chains" target="_blank" rel="noopener noreferrer" className="underline">DefiLlama</a>; type, stage and total value secured from{' '}
                    <a href="https://l2beat.com/scaling/summary" target="_blank" rel="noopener noreferrer" className="underline">L2BEAT</a>.
                </p>
            </Panel>
        </div>
    );
}
