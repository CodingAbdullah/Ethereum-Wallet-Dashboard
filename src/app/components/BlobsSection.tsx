'use client';

import useSWR from 'swr';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import StatTile from './StatTile';
import ValueLineChart from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Link from 'next/link';
import type { Section } from '@/lib/defi';
import type { BlobSummary } from '@/lib/blobs';

const gwei = (v: number) => v === 0 ? '0 gwei' : v < 0.001 ? v.toExponential(1) + ' gwei' : v.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' gwei';

export default function BlobsSection() {
    const { data, error, isLoading } = useSWR<Section<BlobSummary>>('/api/blobs', GenericFetcher, { revalidateOnFocus: false, refreshInterval: 300000 });

    if (isLoading) return <p className="text-center text-gray-400">Reading the last day of blocks…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load blob data. Please try again later.</p>;
    if ('error' in data) return <p className="text-center text-red-400">{data.error}</p>;

    const s = data.data;
    const totalPosted = s.posters.reduce((sum, p) => sum + p.blobs, 0);

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Blobs (last 24h)" value={s.blobsPosted === null ? '—' : s.blobsPosted.toLocaleString('en-US')} note={s.maxBlobsPerBlock ? `up to ${s.maxBlobsPerBlock} per block` : undefined} />
                <StatTile label="Blob space used" value={s.averageUsagePercent.toFixed(1) + '%'} note="of the per-block maximum" />
                <StatTile label="Blob base fee" value={gwei(s.blobBaseFeeGwei)} note="per unit of blob gas, now" />
                <StatTile label="Blob fees burnt (24h)" value={s.blobFeesEth === null ? '—' : s.blobFeesEth.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' ETH'} />
            </div>

            <Panel title="Blob Space Used per Hour" description="Rollups post their transaction data to Ethereum as blobs. When blocks hold more blobs than the target, the blob base fee rises.">
                <ValueLineChart
                    data={s.hourly}
                    dataKey="usagePercent"
                    xKey="hoursAgo"
                    label="Used"
                    formatTick={v => v.toFixed(0) + '%'}
                    formatValue={v => v.toFixed(1) + '%'}
                    formatX={h => `-${h}h`}
                    formatXFull={h => `${h} hour${h === 1 ? '' : 's'} ago`}
                    ariaRange="over the last 24 hours"
                />
            </Panel>

            <Panel title="Who Posted Blobs" description={`Senders of blob transactions in the last ${s.posterBlocks} blocks.`}>
                {s.posters.length === 0 ? <p className="text-gray-500">No blob transactions in these blocks.</p> : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead className="text-gray-300">Sender</TableHead>
                            <TableHead className="text-gray-300 text-right">Blobs</TableHead>
                            <TableHead className="text-gray-300 text-right">Share</TableHead>
                            <TableHead className="text-gray-300 text-right">Transactions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {s.posters.map(p => (
                                <TableRow key={p.address} className="border-b border-gray-800">
                                    <TableCell>
                                        <Link href={`/address/${p.address}`} className="underline text-gray-100">{p.name ?? <span className="font-mono text-xs">{p.address.slice(0, 8)}…{p.address.slice(-6)}</span>}</Link>
                                    </TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{p.blobs}</TableCell>
                                    <TableCell className="text-gray-400 text-right tabular-nums">{totalPosted ? (p.blobs / totalPosted * 100).toFixed(0) + '%' : '—'}</TableCell>
                                    <TableCell className="text-gray-400 text-right tabular-nums">{p.transactions}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <p className="mt-3 text-xs text-gray-500">Known rollup batch posters are named; others show their address.</p>
            </Panel>
        </div>
    );
}
