"use client";

import useSWR from "swr";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import WalletFetcher from "@/app/utils/functions/GenericFetcher";
import TrendingCollectionsType from "../utils/types/TrendingCollectionsType";
import Link from "next/link";

// Trending Collections Table Custom Component
export default function HomePageTrendingCollectionsTable() {
    const { data: trendsData, error: trendingCoinsDataError, isLoading: loadingTrendingCoins } = useSWR<{ trendingCoinData : { nfts: TrendingCollectionsType[] }}>('/api/trending-coin-data', WalletFetcher, { refreshInterval: 50000 });
    
    // Conditionally render this component
    if (trendingCoinsDataError){
        return <div>Error Loading Data...</div>
    }
    else if (loadingTrendingCoins) {
        return <div>Loading Trending Collections Data...</div>
    }
    else {
        // Utilize collection data for Table display
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-gray-100">Top 7 Trending Collections</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Symbol</TableHead>
                            <TableHead className="text-gray-300">Floor Price</TableHead>
                            <TableHead className="text-gray-300">Price Change</TableHead>
                            <TableHead className="text-gray-300">Volume</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {trendsData?.trendingCoinData?.nfts.map(collection => (
                            <TableRow key={collection.id} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">
                                    <Link href={'/collections/erc721-collection/trending-collection/' + collection.id}>
                                        <u>{collection.name}</u>
                                    </Link>
                                </TableCell> 
                                <TableCell className="text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <Image unoptimized alt={`${collection.symbol} logo`} height={15} width={15} src={collection.thumb} />
                                        <span>{collection.symbol}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-300">{collection.data.floor_price}</TableCell>
                                <TableCell className={Number(collection.data.floor_price_in_usd_24h_percentage_change) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Number(collection.data.floor_price_in_usd_24h_percentage_change) > 0 ? '+' + Number(collection.data.floor_price_in_usd_24h_percentage_change).toFixed(2) : Number(collection.data.floor_price_in_usd_24h_percentage_change).toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-gray-300">{collection.data.h24_volume}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}