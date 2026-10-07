'use client';

import useSWR from 'swr';
import PostFetcher from '../utils/functions/PostFetcher';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader } from "../components/ui/card";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

interface CollectionPeriod {
    period: string,
    volume: number,
    sales: number,
    average_price: number,
    volume_change_percent: number
}

// ERC721 Collection Stats Chart Custom Component (OpenSea 24h / 7d / 30d stats)
export default function ERC721CollectionStatsChart(props: { address: string }) {
    const { address } = props;

    const { data, error, isLoading } =
    useSWR<{ periods: CollectionPeriod[], total: { floor_price: number, floor_price_symbol: string, num_owners: number } }>(
        ['/api/erc721-collection-stats', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 300000 }
    );

    if (error) {
        return <div className="p-4 text-red-400">Failed to load collection stats.</div>;
    }
    else if (isLoading || !data) {
        return <div><p className='text-white-100'>Loading ERC721 Collection Stats...</p></div>
    }

    return (
        <div className="mt-10 bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h4 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Volume & Sales
                </span>
            </h4>
            <Card className="w-full bg-gray-900 border-gray-700 mt-10">
                <CardHeader>
                    <CardDescription className="text-gray-100">Contract Address: <b>{' ' + address}</b></CardDescription>
                    <CardDescription className="text-gray-100">
                        Floor Price: <b>{data.total.floor_price + ' ' + (data.total.floor_price_symbol || 'ETH')}</b>
                        {' · '}Owners: <b>{data.total.num_owners.toLocaleString('en-US')}</b>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.periods} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="period" stroke="#888" tick={{ fill: '#888' }} />
                                <YAxis yAxisId="volume" stroke="#888" tick={{ fill: '#888' }} tickFormatter={value => value.toLocaleString('en-US') + ' ETH'} />
                                <YAxis yAxisId="sales" orientation="right" stroke="#888" tick={{ fill: '#888' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} labelStyle={{ color: '#888' }} itemStyle={{ color: '#fff' }} />
                                <Legend />
                                <Bar yAxisId="volume" dataKey="volume" name="Volume (ETH)" fill="#9ca3af" />
                                <Bar yAxisId="sales" dataKey="sales" name="Sales" fill="#4b5563" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        Average sale price: {data.periods.map(period => period.period + ' ' + period.average_price.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' ETH').join(' · ')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
