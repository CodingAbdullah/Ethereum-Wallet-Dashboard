'use client';

import { useState } from 'react';
import useSWR from 'swr';
import PostFetcher from '../utils/functions/PostFetcher';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import CoinChartInfoType from '../utils/types/CoinChartInfoType';

// Generic Chart Page Custom Component
export default function GenericChartPage(props: { data: CoinChartInfoType }) {
    const { data } = props;
    const [interval, setInterval] = useState('7');

    // Fetch data for chart display
    const { data: coinChartData, error: coinChartError, isLoading: coinChartDataLoading }  = useSWR(['/api/coin-prices-by-day', { coin: data.id, interval }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 50000 });

    // Conditionally render data
    if (coinChartError) {
        return <div><p className='text-white-500'>Error Loading Market Cap Chart Data...</p></div>
    }
    else if (coinChartDataLoading) {
        return <div><p className='text-white-100'>Loading Market Cap Chart Data...</p></div>
    }
    else {
        // Retrieve key information
        const chartData = coinChartData.coinPrices;

        // Modifying the y-axis domain for appropriate ranges
        const prices = coinChartData.coinPrices.map((item: any) => item.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const buffer = (max - min) * 0.1; // 10% buffer

        // Render data based on market information
        return (
            <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        Historical Price Information
                    </span>
                </h1>
                <Card className="w-full bg-gray-900 border-gray-700 mt-10">
                    <CardHeader>
                        <CardTitle className="text-xl text-gray-100">{ data.name }</CardTitle>
                        <CardDescription className="text-gray-100">
                            Current Price:<b>{' $' + Number(data.market_data.current_price.usd).toFixed(2)}</b>
                        </CardDescription>
                        <div className="flex items-center space-x-2">
                            <CardDescription className='text-gray-100'>
                                24 Hour % Change: 
                            </CardDescription>
                            <CardDescription className={Number(data.market_data.price_change_percentage_24h) < 0 ? 'text-red-500' : 'text-green-500'}>
                                <b>{Number(data.market_data.price_change_percentage_24h) >= 0 ? ' +' : ''}</b><b>{Number(data.market_data.price_change_percentage_24h).toFixed(2) + '%'}</b>
                            </CardDescription>
                        </div>
                        <Select value={interval} onValueChange={setInterval}>
                            <SelectTrigger className="w-[180px] bg-gray-700 text-gray-100">
                                <SelectValue placeholder="Select Interval" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 text-gray-100">
                                <SelectItem value="24">24 Hours</SelectItem>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="14">15 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 80,
                                        bottom: 20
                                    }}
                                >
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#888" 
                                    tick={{fill: '#888'}}
                                    padding={{ left: 10, right: 10 }}
                                />
                                <YAxis 
                                    stroke="#888" 
                                    dataKey="price"
                                    tick={{fill: '#888'}}
                                    domain={[Math.max(0, min - buffer), max + buffer]}
                                    padding={{ top: 10, bottom: 10 }}
                                    tickFormatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#333', border: 'none'}}
                                    labelStyle={{color: '#888'}}
                                    itemStyle={{color: '#fff'}}  
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke="#ff4136" 
                                    strokeWidth={2}
                                    dot={true}
                                    name="Price"
                                />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
}