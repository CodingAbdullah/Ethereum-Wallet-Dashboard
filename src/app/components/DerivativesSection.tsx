'use client';

import Panel from './DashboardPanel';
import StatTile from './StatTile';
import { usdCompact } from './ValueLineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { Derivatives } from '@/lib/derivatives';

const pct = (fraction: number | null, digits = 4) => fraction === null ? '—' : (fraction * 100 > 0 ? '+' : '') + (fraction * 100).toFixed(digits) + '%';
const signedClass = (v: number | null) => v === null ? 'text-gray-500' : v >= 0 ? 'text-green-400' : 'text-red-400';
const usd = (v: number | null) => v === null ? '—' : usdCompact(v);

// Rendered with data loaded on the server (see ServerSection)
export default function DerivativesSection({ data }: { data: Derivatives }) {

    const options = 'data' in data.options ? data.options.data : null;

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Avg funding (8h)" value={<span className={signedClass(data.averageFunding8h)}>{pct(data.averageFunding8h)}</span>} note={data.averageFunding8h === null ? undefined : data.averageFunding8h >= 0 ? 'longs pay shorts' : 'shorts pay longs'} />
                <StatTile label="Annualized funding" value={<span className={signedClass(data.averageFunding8h)}>{pct(data.averageFunding8h === null ? null : data.averageFunding8h * 3 * 365, 2)}</span>} />
                <StatTile label="Perp open interest" value={usd(data.totalOpenInterestUsd)} note="across the exchanges below" />
                <StatTile label="Options open interest" value={usd(options?.openInterestUsd ?? null)} note={options ? `${Math.round(options.openInterestEth).toLocaleString('en-US')} ETH on Deribit` : undefined} />
            </div>

            <Panel title="Perpetual Futures" description="Funding is what one side of a perpetual pays the other every 8 hours to keep its price near spot. Positive funding means traders are paying to be long.">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="text-gray-300">Exchange</TableHead><TableHead className="text-gray-300">Market</TableHead>
                        <TableHead className="text-gray-300 text-right">Price</TableHead><TableHead className="text-gray-300 text-right">Funding (8h)</TableHead>
                        <TableHead className="text-gray-300 text-right">Annualized</TableHead><TableHead className="text-gray-300 text-right">Open interest</TableHead>
                        <TableHead className="text-gray-300 text-right">24h volume</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {data.perps.map(({ exchange, result }) => 'error' in result ? (
                            <TableRow key={exchange} className="border-b border-gray-800">
                                <TableCell className="text-gray-200 font-medium">{exchange}</TableCell>
                                <TableCell colSpan={6} className="text-gray-500">{result.error}</TableCell>
                            </TableRow>
                        ) : (
                            <TableRow key={exchange} className="border-b border-gray-800">
                                <TableCell className="text-gray-200 font-medium">{exchange}</TableCell>
                                <TableCell className="text-gray-400 whitespace-nowrap">{result.data.market}</TableCell>
                                <TableCell className="text-gray-100 text-right tabular-nums">{result.data.price === null ? '—' : '$' + result.data.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</TableCell>
                                <TableCell className={`text-right tabular-nums ${signedClass(result.data.funding8h)}`}>{pct(result.data.funding8h)}</TableCell>
                                <TableCell className={`text-right tabular-nums ${signedClass(result.data.fundingAnnualized)}`}>{pct(result.data.fundingAnnualized, 2)}</TableCell>
                                <TableCell className="text-gray-100 text-right tabular-nums">{usd(result.data.openInterestUsd)}</TableCell>
                                <TableCell className="text-gray-300 text-right tabular-nums">{usd(result.data.volume24hUsd)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Panel>

            <Panel title="Options (Deribit)" description="The put/call ratio compares open interest in puts (bets on a fall or hedges) to calls (bets on a rise). Above 1 leans bearish.">
                {'error' in data.options ? <p className="text-gray-500">{data.options.error}</p> : (
                    <div className="grid gap-8 md:grid-cols-2">
                        <dl className="divide-y divide-gray-800">
                            {([['Open interest', `${Math.round(data.options.data.openInterestEth).toLocaleString('en-US')} ETH (${usd(data.options.data.openInterestUsd)})`], ['24h volume', usd(data.options.data.volume24hUsd)], ['Put/call ratio', data.options.data.putCallRatio === null ? '—' : data.options.data.putCallRatio.toFixed(2)]] as const).map(([k, v]) => (
                                <div key={k} className="flex justify-between py-3"><dt className="text-gray-400">{k}</dt><dd className="text-gray-100 tabular-nums">{v}</dd></div>
                            ))}
                        </dl>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Largest expiries by open interest</p>
                            <ul className="space-y-1">
                                {data.options.data.topExpiries.map(e => (
                                    <li key={e.expiry} className="flex justify-between text-gray-200"><span>{e.expiry}</span><span className="tabular-nums">{Math.round(e.openInterestEth).toLocaleString('en-US')} ETH</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </Panel>
            <p className="text-center text-xs text-gray-500">From each exchange&apos;s public market-data API, refreshed every few minutes. Not trading advice.</p>
        </div>
    );
}
