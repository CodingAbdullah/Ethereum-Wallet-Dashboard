"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import GenericFetcher from "../utils/functions/GenericFetcher";
import TopLosingCoinsType from "../utils/types/TopLosingCoinsType";

// Top Losing Coins Table Custom Component
export default function TopLosingCoinsTable() {
    const { data: coins, error: coinsError, isLoading: loadingCoins } = useSWR<{top_losers: TopLosingCoinsType[]}>('/api/top-bottom-coin-prices', GenericFetcher, { refreshInterval: 50000 });
    
    // Conditionally render this component
    if (coinsError){
        return <div className="text-red-500 p-4">Error Loading Losing Coins Data...</div>
    }
    else if (loadingCoins) {
        return <div className="text-gray-300 p-4">Loading Losing Coins Data Table...</div>
    }
    else {
        // Render component using the information provided
        return (
            <div className="p-4 bg-gray-900 mt-10 mt-10 shadow-lg">
                <h4 className="text-2xl font-bold mb-4 text-gray-100">Top 5 Losing Coins</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Symbol</TableHead>
                            <TableHead className="text-gray-300">Price</TableHead>
                            <TableHead className="text-gray-300">Price Change</TableHead>
                            <TableHead className="text-gray-300">Market Cap Rank</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coins?.top_losers.splice(0, 5).map(coin => (
                            <TableRow key={coin.name} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">
                                    <Link href={'/prices/' + coin.id}><u>{coin.name}</u></Link>
                                </TableCell>                                
                                <TableCell className="text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <Image unoptimized alt={`${coin.symbol} logo`} height={20} width={20} src={coin.image} />
                                        <span>{String(coin.symbol).toUpperCase()}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-300">{Number(coin.usd) < 0.01 ? '<$0.01' : "$" + Number(coin.usd).toFixed(2)}</TableCell>
                                <TableCell className={Number(coin.usd_24h_change) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Number(coin.usd_24h_change)> 0 ? '+' + Number(coin.usd_24h_change).toFixed(2) : Number(coin.usd_24h_change).toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-gray-300">{coin.market_cap_rank}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}