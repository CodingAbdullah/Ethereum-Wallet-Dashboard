'use client';

import useSWR from 'swr';
import { AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';
import Panel from './DashboardPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { shortAddress } from './ConnectWalletButton';
import type { WalletInsights } from '@/lib/walletInsights';

// Token approvals, DeFi positions and a readable activity feed.
// On /me it loads the signed-in user's saved wallets; on a wallet page it loads one address.
export type InsightsSource = { kind: 'me' } | { kind: 'wallet'; address: string; network: string };

const EXPLORERS: Record<string, string> = { eth: 'https://etherscan.io', sepolia: 'https://sepolia.etherscan.io', hoodi: 'https://hoodi.etherscan.io' };

const usd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const when = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—';

async function fetchInsights(source: InsightsSource): Promise<WalletInsights> {
    const response = source.kind === 'me'
        ? await fetch('/api/portfolio/insights')
        : await fetch('/api/wallet-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: source.address, network: source.network })
        });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load wallet details');
    return response.json();
}

export function insightsKey(source: InsightsSource) {
    return source.kind === 'me' ? '/api/portfolio/insights' : ['/api/wallet-insights', source.address, source.network];
}

function Failed({ count, what }: { count: number; what: string }) {
    if (count === 0) return null;
    return (
        <p className="mb-3 flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Couldn&apos;t load {what} for {count === 1 ? '1 wallet' : count + ' wallets'}.
        </p>
    );
}

export default function WalletInsightsSection({ source }: { source: InsightsSource }) {
    const multiWallet = source.kind === 'me';
    const { data, error, isLoading } = useSWR(insightsKey(source), () => fetchInsights(source), { revalidateOnFocus: false });

    if (isLoading) return <Panel title="Activity, Approvals & DeFi"><p className="text-gray-400">Loading…</p></Panel>;
    if (error || !data) return <Panel title="Activity, Approvals & DeFi"><p className="text-red-400">{error?.message ?? 'Could not load wallet details'}</p></Panel>;

    const { activity, approvals, defi } = data;
    const unlimitedCount = approvals.items.filter(a => a.unlimited).length;

    return (
        <>
            <Panel title="Activity" description="What happened, in plain English.">
                <Failed count={activity.failed.length} what="activity" />
                {activity.items.length === 0 ? <p className="text-gray-500">No recent activity.</p> : (
                    <ul className="divide-y divide-gray-800">
                        {activity.items.map(item => (
                            <li key={item.chain + item.hash + item.wallet + item.category} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3">
                                <span className="text-xs uppercase tracking-wide text-gray-400 sm:w-36 shrink-0">{item.category}</span>
                                <span className="text-gray-100 flex-1 break-words">{item.summary}</span>
                                <span className="text-xs text-gray-500 shrink-0">
                                    {multiWallet && <span className="font-mono mr-2">{shortAddress(item.wallet)}</span>}
                                    <a href={`${EXPLORERS[item.chain] ?? EXPLORERS.eth}/tx/${item.hash}`} target="_blank" rel="noopener noreferrer" className="underline">{when(item.timestamp)}</a>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Panel
                title="Token Approvals"
                description={approvals.items.length === 0
                    ? 'Contracts allowed to spend tokens from your wallet.'
                    : `${approvals.items.length} contract${approvals.items.length === 1 ? '' : 's'} can spend tokens from ${multiWallet ? 'your wallets' : 'this wallet'}${unlimitedCount ? `, ${unlimitedCount} with no limit` : ''}. Remove approvals you no longer use.`}
            >
                <Failed count={approvals.failed.length} what="approvals" />
                {approvals.items.length === 0 ? <p className="text-gray-500">No active token approvals on Ethereum mainnet.</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-300">Token</TableHead>
                                <TableHead className="text-gray-300">Spender</TableHead>
                                <TableHead className="text-gray-300 text-right">Allowance</TableHead>
                                <TableHead className="text-gray-300 text-right">Value at risk</TableHead>
                                <TableHead className="text-gray-300">Approved</TableHead>
                                {multiWallet && <TableHead className="text-gray-300">Wallet</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvals.items.map(a => (
                                <TableRow key={a.wallet + a.tokenAddress + a.spender} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200"><span className="font-medium">{a.tokenSymbol}</span> <span className="text-gray-500">{a.tokenName}</span></TableCell>
                                    <TableCell className="text-gray-300">
                                        <a href={`https://etherscan.io/address/${a.spender}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {a.spenderLabel ?? <span className="font-mono text-xs">{shortAddress(a.spender)}</span>}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {a.unlimited
                                            ? <span className="inline-flex items-center gap-1 text-amber-400"><InfinityIcon className="h-4 w-4" aria-hidden="true" />Unlimited</span>
                                            : <span className="text-gray-300">{a.amount}</span>}
                                    </TableCell>
                                    <TableCell className="text-gray-200 text-right tabular-nums">{a.usdAtRisk === null ? '—' : usd(a.usdAtRisk)}</TableCell>
                                    <TableCell className="text-gray-400 whitespace-nowrap">
                                        {a.transactionHash ? <a href={`https://etherscan.io/tx/${a.transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">{when(a.approvedAt)}</a> : when(a.approvedAt)}
                                    </TableCell>
                                    {multiWallet && <TableCell className="text-gray-400 font-mono text-xs">{shortAddress(a.wallet)}</TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Panel>

            <Panel
                title="DeFi Positions"
                description={defi.items.length > 0 ? <>Total in DeFi: <span className="text-gray-100 font-medium">{usd(defi.totalUsd)}</span>{multiWallet && ' (shown separately from the portfolio total)'}</> : 'Liquidity, lending and staking positions on Ethereum mainnet.'}
            >
                <Failed count={defi.failed.length} what="DeFi positions" />
                {defi.items.length === 0 ? <p className="text-gray-500">No DeFi positions found.</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-300">Protocol</TableHead>
                                <TableHead className="text-gray-300">Position</TableHead>
                                <TableHead className="text-gray-300">Tokens</TableHead>
                                <TableHead className="text-gray-300 text-right">Value</TableHead>
                                <TableHead className="text-gray-300 text-right">Unclaimed</TableHead>
                                {multiWallet && <TableHead className="text-gray-300">Wallet</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {defi.items.map((p, i) => (
                                <TableRow key={p.wallet + p.protocol + p.label + i} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200 font-medium">
                                        {p.protocolUrl ? <a href={p.protocolUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.protocol}</a> : p.protocol}
                                    </TableCell>
                                    <TableCell className="text-gray-400 capitalize">{p.label}</TableCell>
                                    <TableCell className="text-gray-300">{p.tokens.map(t => t.symbol).join(' / ') || '—'}</TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{p.usdValue === null ? '—' : usd(p.usdValue)}</TableCell>
                                    <TableCell className="text-gray-300 text-right tabular-nums">{p.unclaimedUsd ? usd(p.unclaimedUsd) : '—'}</TableCell>
                                    {multiWallet && <TableCell className="text-gray-400 font-mono text-xs">{shortAddress(p.wallet)}</TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Panel>
        </>
    );
}
