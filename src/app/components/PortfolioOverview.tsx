'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Download, AlertTriangle } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { shortAddress } from './ConnectWalletButton';
import type { Portfolio, Section } from '@/lib/portfolio';

type PortfolioResponse = Portfolio & { history: { day: string; usdValue: number; wallets: number }[] };

const NETWORK_NAMES: Record<string, string> = { eth: 'Ethereum', sepolia: 'Sepolia', hoodi: 'Hoodi' };
const EXPLORERS: Record<string, string> = { eth: 'https://etherscan.io', sepolia: 'https://sepolia.etherscan.io', hoodi: 'https://hoodi.etherscan.io' };

const usd = (value: number, compact = false) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 2
}).format(value);
const amount = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: value < 1 ? 6 : 4 });
const shortDay = (day: string) => new Date(day + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

async function fetchPortfolio(url: string): Promise<PortfolioResponse> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load your portfolio');
    return response.json();
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
            <CardHeader className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-100">{title}</CardTitle>
                    {description && <CardDescription className="text-gray-400 mt-1">{description}</CardDescription>}
                </div>
                {action}
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">{children}</CardContent>
        </Card>
    );
}

function SectionNote<T>({ section, children }: { section: Section<T> | null; children: (data: T) => React.ReactNode }) {
    if (!section) return <span className="text-gray-500">—</span>;
    if ('error' in section) return <span className="text-gray-500" title={section.error}>Unavailable</span>;
    return <>{children(section.data)}</>;
}

// Combined portfolio for the signed-in user's saved wallets
export default function PortfolioOverview() {
    const { data, error, isLoading } = useSWR('/api/portfolio', fetchPortfolio, { revalidateOnFocus: false });

    if (isLoading) return <Panel title="Portfolio"><p className="text-gray-400">Loading your wallets… this can take a few seconds.</p></Panel>;
    if (error || !data) return <Panel title="Portfolio"><p className="text-red-400">{error?.message ?? 'Could not load your portfolio'}</p></Panel>;
    if (data.wallets.length === 0) return null;

    const history = data.history;

    return (
        <>
            <Panel
                title="Portfolio"
                description="Combined value of your saved Ethereum mainnet wallets (testnet tokens have no market value)."
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
                        <div className="h-64 w-full" role="img" aria-label={`Portfolio value from ${history[0].day} to ${history[history.length - 1].day}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tickFormatter={shortDay} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#4B5563' }} minTickGap={24} />
                                    <YAxis tickFormatter={v => usd(v, true)} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                                    <Tooltip
                                        cursor={{ stroke: '#6B7280' }}
                                        contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#F3F4F6' }}
                                        labelFormatter={label => shortDay(String(label))}
                                        formatter={value => [usd(Number(value)), 'Value']}
                                    />
                                    <Line type="monotone" dataKey="usdValue" stroke="#E5E7EB" strokeWidth={2} dot={history.length <= 14 ? { r: 4, fill: '#E5E7EB', stroke: '#111827', strokeWidth: 2 } : false} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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
                                <TableCell className="text-gray-400">{NETWORK_NAMES[wallet.chain] ?? wallet.chain}</TableCell>
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
                <Panel title="Holdings" description="Tokens across your mainnet wallets, largest first.">
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
                                        {token.wallets > 1 && <span className="ml-2 text-xs text-gray-500">({token.wallets} wallets)</span>}
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

            {data.activity.length > 0 && (
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
                                            <a href={`${EXPLORERS[tx.chain] ?? EXPLORERS.eth}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline font-mono text-xs">{tx.hash.slice(0, 10)}…</a>
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
