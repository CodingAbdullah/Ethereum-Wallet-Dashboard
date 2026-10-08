'use client';

import Panel from './DashboardPanel';
import StatTile from './StatTile';
import ValueLineChart from './ValueLineChart';
import type { Section } from '@/lib/defi';
import type { SupplySummary } from '@/lib/ethSupply';

const eth = (value: number, digits = 2) => value.toLocaleString('en-US', { maximumFractionDigits: digits }) + ' ETH';
const signed = (value: number, digits = 2) => (value > 0 ? '+' : '') + eth(value, digits);

// Rendered with data loaded on the server (see ServerSection)
export default function EthSupplySection({ data }: { data: Section<SupplySummary> }) {
    if ('error' in data) return <p className="text-center text-red-400">{data.error}</p>;

    const s = data.data;
    const hours = Math.round(s.windowHours);
    const shrinking = s.netEth !== null && s.netEth < 0;

    return (
        <div className="container mx-auto w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label={`Burnt (last ${hours}h)`} value={eth(s.burnEth)} note={s.blobBurnEth > 0.005 ? `incl. ${eth(s.blobBurnEth)} in blob fees` : 'base fees destroyed by EIP-1559'} />
                <StatTile label={`Issued (last ${hours}h)`} value={s.issuanceEth === null ? '—' : '≈ ' + eth(s.issuanceEth, 0)} note="estimated staking rewards" />
                <StatTile
                    label="Net supply change"
                    value={s.netEth === null ? '—' : <span className={shrinking ? 'text-green-400' : 'text-gray-100'}>{signed(s.netEth, 0)}</span>}
                    note={s.netEth === null ? undefined : shrinking ? 'supply shrank (deflationary)' : 'supply grew (inflationary)'}
                />
                <StatTile label="Yearly rate at this pace" value={s.yearlyNetPercent === null ? '—' : (s.yearlyNetPercent > 0 ? '+' : '') + s.yearlyNetPercent.toFixed(2) + '%'} note={s.supply ? `of ${Math.round(s.supply / 1e6).toLocaleString('en-US')}M ETH` : undefined} />
            </div>

            <Panel title="ETH Burnt per Hour" description={`Last ${hours} hours. More activity means higher base fees and more ETH burnt. Current base fee: ${s.baseFeeGwei < 0.1 ? s.baseFeeGwei.toPrecision(2) : s.baseFeeGwei.toFixed(2)} gwei.`}>
                <ValueLineChart
                    data={s.hourly}
                    dataKey="burnEth"
                    xKey="hoursAgo"
                    label="Burnt"
                    formatTick={v => v.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                    formatValue={v => eth(v, 3)}
                    formatX={h => `-${h}h`}
                    formatXFull={h => `${h} hour${h === 1 ? '' : 's'} ago`}
                    ariaRange={`over the last ${hours} hours`}
                />
            </Panel>

            <Panel title="How This Is Calculated">
                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li><b className="text-gray-100">Burnt</b> is measured: base fee × gas used for each of the last {s.windowBlocks.toLocaleString('en-US')} blocks, plus blob base fee × blob gas, from the node&apos;s fee history.</li>
                    <li><b className="text-gray-100">Issued</b> is an estimate: staking rewards scale with the square root of the total stake (about 166 × √staked ETH per year){s.stakedEth ? `, using ≈${Math.round(s.stakedEth / 1e6)}M ETH staked (active validators × 32)` : ''}. Missed validator duties make real issuance slightly lower.</li>
                    <li>Circulating supply is from CoinGecko. Withdrawals and deposits move ETH in and out of staking but don&apos;t change total supply.</li>
                </ul>
            </Panel>
        </div>
    );
}
