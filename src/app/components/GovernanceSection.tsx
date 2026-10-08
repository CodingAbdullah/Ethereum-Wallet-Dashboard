'use client';

import Panel from './DashboardPanel';
import type { Proposal } from '@/lib/governance';

function timeLeft(end: number, now = Date.now() / 1000) {
    const s = end - now;
    if (s <= 0) return 'ended';
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((s % 3600) / 60)}m left`;
}

function ProposalRow({ p }: { p: Proposal }) {
    return (
        <li className="py-4 flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-gray-100 font-medium hover:underline break-words">{p.title}</a>
                <span className="text-xs text-gray-400 shrink-0">{p.state === 'active' ? timeLeft(p.end) : 'closed ' + new Date(p.end * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            </div>
            <div className="text-sm text-gray-400 flex flex-wrap gap-x-4">
                <span className="text-gray-300">{p.spaceName}</span>
                <span>{p.votes.toLocaleString('en-US')} votes</span>
                {p.leading && <span>{p.state === 'active' ? 'Leading' : 'Result'}: <span className="text-gray-200">{p.leading.choice}</span> ({p.leading.percent.toFixed(0)}%)</span>}
                {p.quorumReached !== null && <span>{p.quorumReached ? 'Quorum reached' : 'Below quorum'}</span>}
            </div>
        </li>
    );
}

// Rendered with data loaded on the server (see ServerSection)
export default function GovernanceSection({ data }: { data: { data: { active: Proposal[]; closed: Proposal[] } } | { error: string } }) {
    if ('error' in data) return <p className="text-center text-red-400">{data.error}</p>;

    return (
        <div className="container mx-auto w-full max-w-5xl space-y-8">
            <Panel title="Voting Now" description="Open Snapshot votes for major Ethereum protocols, ending soonest first.">
                {data.data.active.length === 0 ? <p className="text-gray-500">No active votes right now.</p> : <ul className="divide-y divide-gray-800">{data.data.active.map(p => <ProposalRow key={p.id} p={p} />)}</ul>}
            </Panel>
            <Panel title="Recently Closed">
                {data.data.closed.length === 0 ? <p className="text-gray-500">Nothing closed recently.</p> : <ul className="divide-y divide-gray-800">{data.data.closed.map(p => <ProposalRow key={p.id} p={p} />)}</ul>}
            </Panel>
            <p className="text-center text-xs text-gray-500">From Snapshot (off-chain votes). Some protocols also vote on-chain; those votes aren&apos;t shown here.</p>
        </div>
    );
}
