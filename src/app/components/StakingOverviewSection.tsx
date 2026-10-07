'use client';

import useSWR from 'swr';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import StatTile from './StatTile';
import { usdCompact } from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { StakingOverview, StakingProtocol } from '@/lib/stakingOverview';
import type { Section } from '@/lib/defi';

function ProtocolTable({ section }: { section: Section<StakingProtocol[]> }) {
    if ('error' in section) return <p className="text-gray-500">{section.error}</p>;
    if (section.data.length === 0) return <p className="text-gray-500">No protocols found.</p>;
    return (
        <Table>
            <TableHeader><TableRow>
                <TableHead className="text-gray-300">Protocol</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300 text-right">Value locked</TableHead>
                <TableHead className="text-gray-300 text-right">7d</TableHead>
            </TableRow></TableHeader>
            <TableBody>
                {section.data.map(p => (
                    <TableRow key={p.name} className="border-b border-gray-800">
                        <TableCell className="text-gray-100 font-medium">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.name}</a> : p.name}</TableCell>
                        <TableCell className="text-gray-400 whitespace-nowrap">{p.category}</TableCell>
                        <TableCell className="text-gray-100 text-right tabular-nums">{usdCompact(p.tvl)}</TableCell>
                        <TableCell className={`text-right tabular-nums ${p.change7d === null ? 'text-gray-500' : p.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>{p.change7d === null ? '—' : (p.change7d >= 0 ? '+' : '') + p.change7d.toFixed(1) + '%'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// Staking ratio, reward rate and the liquid staking / restaking landscape
export default function StakingOverviewSection() {
    const { data, error, isLoading } = useSWR<StakingOverview>('/api/staking-overview', GenericFetcher, { revalidateOnFocus: false });

    if (isLoading) return <p className="text-center text-gray-400">Loading staking overview…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load the staking overview.</p>;

    const s = data.summary;
    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8 mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="ETH staked" value={s.stakedEth === null ? '—' : (s.stakedEth / 1e6).toFixed(1) + 'M'} note="active validators × 32 ETH" />
                <StatTile label="Share of supply staked" value={s.stakingRatio === null ? '—' : (s.stakingRatio * 100).toFixed(1) + '%'} />
                <StatTile label="Base reward rate" value={s.baseApr === null ? '—' : '≈ ' + s.baseApr.toFixed(2) + '%'} note="consensus rewards; tips and MEV add more" />
                <StatTile label="Active validators" value={s.validators === null ? '—' : s.validators.toLocaleString('en-US')} note="in 32 ETH units" />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
                <Panel title="Liquid Staking" description="Stake ETH and get a token you can still use in DeFi (stETH, rETH, ...). Ranked by value locked on Ethereum.">
                    <ProtocolTable section={data.liquid} />
                </Panel>
                <Panel title="Restaking" description="Reuse staked ETH to secure other services for extra rewards, and extra risk. Includes liquid restaking tokens.">
                    <ProtocolTable section={data.restaking} />
                </Panel>
            </div>
            <p className="text-center text-xs text-gray-500">Staked amount from the Beacon API; protocol values from DefiLlama. The reward rate is an estimate from the amount staked.</p>
        </div>
    );
}
