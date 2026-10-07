'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Single-series USD line over days: 2px line, recessive grid, hover tooltip, no legend (the title names it)
export const usdCompact = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
const usdFull = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
const shortDay = (day: string) => new Date(day + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDay = (day: string) => new Date(day + 'T00:00:00Z').toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export default function ValueLineChart<T extends { day: string }>({ data, dataKey, label, height = 'h-64', compactTooltip = false }: {
    data: T[];
    dataKey: keyof T & string;
    label: string;
    height?: string;
    compactTooltip?: boolean;
}) {
    return (
        <div className={`${height} w-full`} role="img" aria-label={`${label} from ${data[0]?.day} to ${data[data.length - 1]?.day}`}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickFormatter={shortDay} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#4B5563' }} minTickGap={24} />
                    <YAxis tickFormatter={usdCompact} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                    <Tooltip
                        cursor={{ stroke: '#6B7280' }}
                        contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, color: '#F3F4F6' }}
                        labelFormatter={day => fullDay(String(day))}
                        formatter={value => [compactTooltip ? usdCompact(Number(value)) : usdFull(Number(value)), label]}
                    />
                    <Line type="monotone" dataKey={dataKey} stroke="#E5E7EB" strokeWidth={2} dot={data.length <= 14 ? { r: 4, fill: '#E5E7EB', stroke: '#111827', strokeWidth: 2 } : false} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
