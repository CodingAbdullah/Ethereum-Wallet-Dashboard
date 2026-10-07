'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Download, AlertTriangle } from 'lucide-react';
import ValueLineChart from './ValueLineChart';
import { RiskBadge, riskKey, useTokenRisks } from './TokenRiskBadge';
import Panel from './DashboardPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { shortAddress } from './ConnectWalletButton';
import type { Portfolio, Section } from '@/lib/portfolio';
import type { WalletInsights } from '@/lib/walletInsights';
import { chainInfo, explorerTx } from '@/lib/chains';

type PortfolioResponse = Portfolio & { history: { day: string; usdValue: number; wallets: number }[] };


const usd = (value: number, compact = false) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 2
}).format(value);
const amount = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: value < 1 ? 6 : 4 });

async function fetchPortfolio(url: string): Promise<PortfolioResponse> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load your portfolio');
    return response.json();
}

function SectionNote<T>({ section, children }: { section: Section<T> | null; children: (data: T) => React.ReactNode }) {
    if (!section) return <span className="text-gray-500">—</span>;
    if ('error' in section) return <span className="text-gray-500" title={section.error}>Unavailable</span>;
    return <>{children(section.data)}</>;
}

// Combined portfolio for the signed-in user's saved wallets
export default function PortfolioOverview() {
    const { data, error, isLoading } = useSWR('/api/portfolio', fetchPortfolio, { revalidateOnFocus: false });
    // The readable activity feed (WalletInsightsSection) replaces this list; it's only shown if that feed fails
    const { data: insights, error: insightsError } = useSWR<WalletInsights>('/api/portfolio/insights', null);
    const showRawActivity = !!insightsError || (!!insights && insights.activity.items.length === 0 && insights.activity.failed.length > 0);
    const { data: risks } = useTokenRisks((data?.holdings ?? []).slice(0, 25).map(t => ({ chain: t.chain, address: t.tokenAddress })));

    if (isLoading) return <Panel title="Portfolio"><p className="text-gray-400">Loading your wallets… this can take a few seconds.</p></Panel>;
    if (error || !data) return <Panel title="Portfolio"><p className="text-red-400">{error?.message ?? 'Could not load your portfolio'}</p></Panel>;
    if (data.wallets.length === 0) return null;

    const history = data.history;

    return (
        <>
            <Panel
                title="Portfolio"
                description="Combined value of your saved wallets across Ethereum and L2s (testnet tokens have no market value)."
                action={
                    <a href="/api/portfolio/export" download className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 ring-1 ring-gray-700 hover:bg-gray-700 hover:text-white shrink-0 self-start">
                        <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
                    </a>
                }
            >
                <p className="text-sm text-gray-400">Total value</p>
                <p className="text-4xl font-bold text-gray-100 tabular-nums">{usd(data.totalUsd)}</p>
                {data.incomplete && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-amber-400">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Some wallets could not be loaded, so this total is missing them.
                    </p>
                )}

                <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">Value over time</p>
                    {history.length < 2 ? (
                        <p className="text-gray-500 text-sm">The chart fills in as daily snapshots are saved. Check back tomorrow.</p>
                    ) : (
                        <ValueLineChart data={history} dataKey="usdValue" label="Value" />
                    )}
                </div>
            </Panel>

            <Panel title="Wallets">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Wallet</TableHead>
                            <TableHead className="text-gray-300">Network</TableHead>
                            <TableHead className="text-gray-300 text-right">Value</TableHead>
                            <TableHead className="text-gray-300 text-right">Tokens</TableHead>
                            <TableHead className="text-gray-300 text-right">NFTs</TableHead>
                            <TableHead className="text-gray-300 text-right">Realized PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.wallets.map(({ wallet, usdValue, tokens, nfts, pnl }) => (
                            <TableRow key={wallet.id} className="border-b border-gray-800">
                                <TableCell className="text-gray-200">
                                    <Link href={`/wallet-activity/${wallet.address}`} className="hover:underline">{wallet.label ?? shortAddress(wallet.address)}</Link>
                                </TableCell>
                                <TableCell className="text-gray-400">{chainInfo(wallet.chain).name}</TableCell>
                                <TableCell className="text-gray-200 text-right tabular-nums">{usdValue === null ? <span className="text-gray-500">Unavailable</span> : usd(usdValue)}</TableCell>
                                <TableCell className="text-gray-300 text-right tabular-nums"><SectionNote section={tokens}>{t => t.length}</SectionNote></TableCell>
                                <TableCell className="text-gray-300 text-right tabular-nums"><SectionNote section={nfts}>{n => n.items.length + (n.hasMore ? '+' : '')}</SectionNote></TableCell>
                                <TableCell className="text-right tabular-nums">
                                    <SectionNote section={pnl}>
                                        {p => p.realizedProfitUsd === null
                                            ? <span className="text-gray-500">—</span>
                                            : <span className={p.realizedProfitUsd >= 0 ? 'text-green-400' : 'text-red-400'}>{(p.realizedProfitUsd >= 0 ? '+' : '') + usd(p.realizedProfitUsd)}</span>}
                                    </SectionNote>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p className="mt-3 text-xs text-gray-500">PnL comes from Moralis and may not be available on the free plan; other columns still load.</p>
            </Panel>

            {data.holdings.length > 0 && (
                <Panel title="Holdings" description="Tokens across your wallets, largest first.">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-300">Token</TableHead>
                                <TableHead className="text-gray-300 text-right">Balance</TableHead>
                                <TableHead className="text-gray-300 text-right">Price</TableHead>
                                <TableHead className="text-gray-300 text-right">24h</TableHead>
                                <TableHead className="text-gray-300 text-right">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.holdings.slice(0, 25).map(token => (
                                <TableRow key={token.chain + token.tokenAddress} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200">
                                        <span className="font-medium">{token.symbol}</span> <span className="text-gray-500">{token.name}</span>
                                        {token.chain !== 'eth' && <span className="ml-2 text-xs text-gray-500">on {chainInfo(token.chain).name}</span>}
                                        {token.wallets > 1 && <span className="ml-2 text-xs text-gray-500">({token.wallets} wallets)</span>}
                                        <span className="ml-2"><RiskBadge risk={risks?.[riskKey(token.chain, token.tokenAddress)]} compact /></span>
                                    </TableCell>
                                    <TableCell className="text-gray-300 text-right tabular-nums">{amount(token.balance)}</TableCell>
                                    <TableCell className="text-gray-300 text-right tabular-nums">{token.usdPrice === null ? '—' : usd(token.usdPrice)}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {token.change24h === null ? <span className="text-gray-500">—</span>
                                            : <span className={token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>{(token.change24h >= 0 ? '+' : '') + token.change24h.toFixed(2)}%</span>}
                                    </TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{usd(token.usdValue)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            )}

            {showRawActivity && data.activity.length > 0 && (
                <Panel title="Recent Activity" description="Latest transactions across your saved wallets.">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-300">When</TableHead>
                                <TableHead className="text-gray-300">Wallet</TableHead>
                                <TableHead className="text-gray-300">Direction</TableHead>
                                <TableHead className="text-gray-300 text-right">ETH</TableHead>
                                <TableHead className="text-gray-300">Transaction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.activity.map(tx => {
                                const outgoing = tx.from.toLowerCase() === tx.wallet.toLowerCase();
                                return (
                                    <TableRow key={tx.chain + tx.hash + tx.wallet} className="border-b border-gray-800">
                                        <TableCell className="text-gray-300 whitespace-nowrap">{new Date(tx.timestamp * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                        <TableCell className="text-gray-300 font-mono text-xs">{shortAddress(tx.wallet)}</TableCell>
                                        <TableCell className="text-gray-300">{outgoing ? 'Sent' : 'Received'}{tx.failed && <span className="ml-2 text-red-400">(failed)</span>}</TableCell>
                                        <TableCell className="text-gray-200 text-right tabular-nums">{amount(tx.valueEth)}</TableCell>
                                        <TableCell>
                                            <a href={explorerTx(tx.chain, tx.hash)} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline font-mono text-xs">{tx.hash.slice(0, 10)}…</a>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Panel>
            )}
        </>
    );
}
