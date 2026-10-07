'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GenericFetcher from '../utils/functions/GenericFetcher';
import { usdCompact } from './ValueLineChart';
import type { DefiOverview } from '@/lib/defi';
import type { L2Overview } from '@/lib/l2';

function SummaryCard({ title, href, cta, children }: { title: string; href: string; cta: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col rounded-lg bg-gray-900 border border-gray-800 p-5">
            <h2 className="text-xl font-bold text-gray-100 mb-3">{title}</h2>
            <div className="flex-1 space-y-2 text-gray-300">{children}</div>
            <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm text-gray-200 hover:underline">{cta} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
    );
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <p className="flex justify-between gap-4"><span className="text-gray-400">{label}</span><span className="text-gray-100 tabular-nums">{value}</span></p>
);

// DeFi, layer 2 and Ethereum summary cards linking to their full pages
export default function HomeSummaryCards() {
    const { data: defi } = useSWR<DefiOverview>('/api/defi-overview', GenericFetcher, { revalidateOnFocus: false });
    const { data: l2 } = useSWR<L2Overview>('/api/l2-overview', GenericFetcher, { revalidateOnFocus: false });

    const tvl = defi && 'data' in defi.chains ? defi.chains.data.reduce((s, c) => s + c.tvl, 0) : null;
    const topL2s = l2?.rows.filter(r => r.tvl !== null).slice(0, 3) ?? [];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard title="DeFi" href="/defi" cta="DeFi overview">
                <Row label="Total value locked" value={tvl === null ? '—' : usdCompact(tvl)} />
                <Row label="DEX volume (24h)" value={defi && 'data' in defi.dexs && defi.dexs.data.total24h !== null ? usdCompact(defi.dexs.data.total24h) : '—'} />
                <Row label="Stablecoins" value={defi && 'data' in defi.stablecoins ? usdCompact(defi.stablecoins.data.total) : '—'} />
            </SummaryCard>
            <SummaryCard title="Layer 2s" href="/l2" cta="Compare L2s">
                {topL2s.length === 0 ? <p className="text-gray-500">—</p> : topL2s.map(r => (
                    <Row key={r.key} label={r.name} value={<>{usdCompact(r.tvl!)}{r.stage && <span className="ml-2 text-xs text-gray-400">{r.stage}</span>}</>} />
                ))}
            </SummaryCard>
            <SummaryCard title="Ethereum" href="/eth-supply" cta="Supply & burn">
                <p><Link href="/block/latest" className="hover:underline">Latest block</Link> · <Link href="/blobs" className="hover:underline">Blobs</Link> · <Link href="/mev" className="hover:underline">MEV</Link></p>
                <p><Link href="/staking" className="hover:underline">Staking</Link> · <Link href="/governance" className="hover:underline">Governance</Link> · <Link href="/eip-protocols" className="hover:underline">Upgrades</Link></p>
                <p className="text-sm text-gray-400">Explore blocks, blob usage, block builders, DAO votes and what&apos;s in the next upgrade.</p>
            </SummaryCard>
        </div>
    );
}
