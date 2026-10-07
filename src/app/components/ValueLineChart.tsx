'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Single-series line: 2px line, recessive grid, hover tooltip, no legend (the title names it).
// Defaults to USD values over days; pass xKey/formatters for other units.
export const usdCompact = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
const usdFull = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const shortDay = (day: unknown) => new Date(String(day) + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = (day: unknown) => new Date(String(day) + 'T00:00:00Z').toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export default function ValueLineChart<T extends Record<string, unknown>>({
    data, dataKey, label, xKey = 'day', height = 'h-64', compactTooltip = false,
    formatTick = usdCompact, formatValue, formatX = shortDay, formatXFull = fullDay, ariaRange
}: {
    data: T[];
    dataKey: keyof T & string;
    label: string;
    xKey?: keyof T & string;
    height?: string;
    compactTooltip?: boolean;
    formatTick?: (value: number) => string;
    formatValue?: (value: number) => string;
    formatX?: (x: unknown) => string;
    formatXFull?: (x: unknown) => string;
    ariaRange?: string;
}) {
    const tooltipValue = formatValue ?? (compactTooltip ? usdCompact : usdFull);
    const range = ariaRange ?? `from ${formatXFull(data[0]?.[xKey])} to ${formatXFull(data[data.length - 1]?.[xKey])}`;
    return (
        <div className={`${height} w-full`} role="img" aria-label={`${label} ${range}`}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data as Record<string, unknown>[]} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey as string} tickFormatter={formatX} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#4B5563' }} minTickGap={24} />
                    <YAxis tickFormatter={formatTick} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                    <Tooltip
                        cursor={{ stroke: '#6B7280' }}
                        contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#F3F4F6' }}
                        labelFormatter={formatXFull}
                        formatter={value => [tooltipValue(Number(value)), label]}
                    />
                    <Line type="monotone" dataKey={dataKey as string} stroke="#E5E7EB" strokeWidth={2} dot={data.length <= 14 ? { r: 4, fill: '#E5E7EB', stroke: '#111827', strokeWidth: 2 } : false} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
