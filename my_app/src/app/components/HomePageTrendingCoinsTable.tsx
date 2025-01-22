"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TrendingCoinsType from "../utils/types/TrendingCoinsType";
import GenericFetcher from "../utils/functions/GenericFetcher";

// Trending Coins Table Custom Component
export default function HomePageTrendingCoinsTable() {
    const { data: trendsData, error: trendingCoinsDataError, isLoading: loadingTrendingCoins } = useSWR('/api/trending-coin-data', GenericFetcher, { refreshInterval: 50000 });
    
    // Conditionally render this component
    if (trendingCoinsDataError){
        return <div>Error Loading Data...</div>
    }
    else if (loadingTrendingCoins) {
        return <div>Loading Trending Coins Data...</div>
    }
    else {
        // Utilize coin data for Table display
        const trendingCoinData: TrendingCoinsType[] = trendsData.trendingCoinData.coins;
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-100">Top 7 Trending Coins</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Symbol</TableHead>
                            <TableHead className="text-gray-300">Price</TableHead>
                            <TableHead className="text-gray-300">Price Change</TableHead>
                            <TableHead className="text-gray-300">Market Cap Rank</TableHead>
                            <TableHead className="text-gray-300">Market Cap</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trendingCoinData.splice(0, 7).map(coin => (
                            <TableRow key={coin.item.id} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">
                                    <Link href={'/prices/' + coin.item.id}><u>{coin.item.name}</u></Link>
                                </TableCell>                                
                                <TableCell className="text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <Image unoptimized alt={`${coin.item.symbol} logo`} height={15} width={15} src={coin.item.small} />
                                        <span>{coin.item.symbol}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-300">{"$" + Number(coin.item.data.price).toFixed(2)}</TableCell>
                                <TableCell className={Number(coin.item.data.price_change_percentage_24h.usd) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Number(coin.item.data.price_change_percentage_24h.usd) > 0 ? '+' + Number(coin.item.data.price_change_percentage_24h.usd).toFixed(2) : Number(coin.item.data.price_change_percentage_24h.usd).toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-gray-300">{coin.item.market_cap_rank}</TableCell>
                                <TableCell className="text-gray-300">{coin.item.data.market_cap}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}