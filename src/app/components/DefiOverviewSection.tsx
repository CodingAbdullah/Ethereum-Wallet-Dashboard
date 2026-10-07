'use client';

import useSWR from 'swr';
import GenericFetcher from '../utils/functions/GenericFetcher';
import Panel from './DashboardPanel';
import ValueLineChart, { usdCompact } from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { DefiOverview, Section } from '@/lib/defi';

const pct = (value: number | null) => value === null ? <span className="text-gray-500">—</span>
    : <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>{(value >= 0 ? '+' : '') + value.toFixed(2)}%</span>;
const price = (value: number | null) => value === null ? '—' : '$' + value.toFixed(4);

function Stat({ label, value, change }: { label: string; value: number | null | undefined; change?: number | null }) {
    return (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-100 tabular-nums">{value === null || value === undefined ? '—' : usdCompact(value)}</p>
            {change !== undefined && value !== null && value !== undefined && <p className="text-sm mt-1">{pct(change ?? null)} <span className="text-gray-500">24h</span></p>}
        </div>
    );
}

// Renders a section's table, or a short note when that DefiLlama endpoint failed
function SectionBody<T>({ section, children }: { section: Section<T>; children: (data: T) => React.ReactNode }) {
    if ('error' in section) return <p className="text-gray-500">{section.error}</p>;
    return <>{children(section.data)}</>;
}

const head = "text-gray-300";
const right = "text-right tabular-nums";

export default function DefiOverviewSection() {
    const { data, error, isLoading } = useSWR<DefiOverview>('/api/defi-overview', GenericFetcher, { revalidateOnFocus: false, refreshInterval: 600000 });

    if (isLoading) return <p className="text-center text-gray-400">Loading DeFi data…</p>;
    if (error || !data) return <p className="text-center text-red-400">Could not load DeFi data. Please try again later.</p>;

    const { chains, protocols, tvlHistory, dexs, fees, stablecoins, yields } = data;
    const totalTvl = 'data' in chains ? chains.data.reduce((sum, c) => sum + c.tvl, 0) : null;

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total value locked" value={totalTvl} />
                <Stat label="DEX volume (24h)" value={'data' in dexs ? dexs.data.total24h : null} change={'data' in dexs ? dexs.data.change1d : null} />
                <Stat label="Fees paid (24h)" value={'data' in fees ? fees.data.total24h : null} change={'data' in fees ? fees.data.change1d : null} />
                <Stat label="Stablecoin supply" value={'data' in stablecoins ? stablecoins.data.total : null} />
            </div>

            <Panel title="Total Value Locked" description="All chains, last 12 months.">
                <SectionBody section={tvlHistory}>
                    {history => history.length < 2 ? <p className="text-gray-500">Not enough data yet.</p> : <ValueLineChart data={history} dataKey="tvl" label="TVL" height="h-72" compactTooltip />}
                </SectionBody>
            </Panel>

            <div className="grid gap-8 lg:grid-cols-2">
                <Panel title="Chains" description="Ranked by value locked.">
                    <SectionBody section={chains}>
                        {rows => (
                            <Table>
                                <TableHeader><TableRow><TableHead className={head}>Chain</TableHead><TableHead className={`${head} text-right`}>TVL</TableHead><TableHead className={`${head} text-right`}>Share</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {rows.slice(0, 15).map(c => (
                                        <TableRow key={c.name} className="border-b border-gray-800">
                                            <TableCell className="text-gray-200">{c.name} {c.tokenSymbol && <span className="text-gray-500 text-xs">{c.tokenSymbol}</span>}</TableCell>
                                            <TableCell className={`text-gray-100 ${right}`}>{usdCompact(c.tvl)}</TableCell>
                                            <TableCell className={`text-gray-400 ${right}`}>{(c.share * 100).toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </SectionBody>
                </Panel>

                <Panel title="Stablecoins" description="Ranked by circulating supply.">
                    <SectionBody section={stablecoins}>
                        {({ top }) => (
                            <Table>
                                <TableHeader><TableRow><TableHead className={head}>Stablecoin</TableHead><TableHead className={`${head} text-right`}>Supply</TableHead><TableHead className={`${head} text-right`}>Price</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {top.slice(0, 15).map(s => (
                                        <TableRow key={s.symbol + s.name} className="border-b border-gray-800">
                                            <TableCell className="text-gray-200"><span className="font-medium">{s.symbol}</span> <span className="text-gray-500">{s.name}</span></TableCell>
                                            <TableCell className={`text-gray-100 ${right}`}>{usdCompact(s.circulating)}</TableCell>
                                            <TableCell className={`text-gray-300 ${right}`}>{price(s.price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </SectionBody>
                </Panel>
            </div>

            <Panel title="Protocols" description="Largest DeFi protocols by value locked (centralized exchanges excluded).">
                <SectionBody section={protocols}>
                    {rows => (
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead className={head}>Protocol</TableHead><TableHead className={head}>Category</TableHead><TableHead className={`${head} text-right`}>Chains</TableHead>
                                <TableHead className={`${head} text-right`}>TVL</TableHead><TableHead className={`${head} text-right`}>1d</TableHead><TableHead className={`${head} text-right`}>7d</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {rows.map(p => (
                                    <TableRow key={p.slug ?? p.name} className="border-b border-gray-800">
                                        <TableCell className="text-gray-200 font-medium">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.name}</a> : p.name}</TableCell>
                                        <TableCell className="text-gray-400">{p.category}</TableCell>
                                        <TableCell className={`text-gray-400 ${right}`}>{p.chains}</TableCell>
                                        <TableCell className={`text-gray-100 ${right}`}>{usdCompact(p.tvl)}</TableCell>
                                        <TableCell className={right}>{pct(p.change1d)}</TableCell>
                                        <TableCell className={right}>{pct(p.change7d)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </SectionBody>
            </Panel>

            <div className="grid gap-8 lg:grid-cols-2">
                {([['DEX Volume', 'Exchanges ranked by 24h trading volume.', dexs], ['Fees', 'Protocols ranked by fees users paid in the last 24h.', fees]] as const).map(([title, description, section]) => (
                    <Panel key={title} title={title} description={description}>
                        <SectionBody section={section}>
                            {({ top }) => (
                                <Table>
                                    <TableHeader><TableRow><TableHead className={head}>Name</TableHead><TableHead className={`${head} text-right`}>24h</TableHead><TableHead className={`${head} text-right`}>Change</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {top.slice(0, 15).map(d => (
                                            <TableRow key={d.name} className="border-b border-gray-800">
                                                <TableCell className="text-gray-200">{d.name}</TableCell>
                                                <TableCell className={`text-gray-100 ${right}`}>{usdCompact(d.total24h)}</TableCell>
                                                <TableCell className={right}>{pct(d.change1d)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </SectionBody>
                    </Panel>
                ))}
            </div>

            {'data' in yields && yields.data.length > 0 && (
                <Panel title="Yields" description="Highest APYs on pools holding at least $10M. Rates change often and rewards can be paid in volatile tokens.">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead className={head}>Pool</TableHead><TableHead className={head}>Project</TableHead><TableHead className={head}>Chain</TableHead>
                            <TableHead className={`${head} text-right`}>TVL</TableHead><TableHead className={`${head} text-right`}>APY</TableHead><TableHead className={`${head} text-right`}>Base / Reward</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {yields.data.map((p, i) => (
                                <TableRow key={p.project + p.symbol + p.chain + i} className="border-b border-gray-800">
                                    <TableCell className="text-gray-200 font-medium">{p.symbol}{p.stablecoin && <span className="ml-2 text-xs text-gray-500">stable</span>}</TableCell>
                                    <TableCell className="text-gray-300">{p.project}</TableCell>
                                    <TableCell className="text-gray-400">{p.chain}</TableCell>
                                    <TableCell className={`text-gray-300 ${right}`}>{usdCompact(p.tvl)}</TableCell>
                                    <TableCell className={`text-gray-100 ${right}`}>{p.apy.toFixed(2)}%</TableCell>
                                    <TableCell className={`text-gray-400 ${right}`}>{(p.apyBase ?? 0).toFixed(2)}% / {(p.apyReward ?? 0).toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            )}

            <p className="text-center text-xs text-gray-500">
                Data from <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="underline">DefiLlama</a>, refreshed every 30–60 minutes.
            </p>
        </div>
    );
}
