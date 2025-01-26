"use client";

import useSWR from "swr";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import GenericFetcher from "../utils/functions/GenericFetcher";
import TopERC721CollectionsType from "../utils/types/TopERC721CollectionsType";

// Top ERC721 Collections Info Table Custom Component
export default function TopERC721CollectionsInfoTable() {
    const { data: collections, error: collectionsError, isLoading: loadingCollections } = useSWR<{ topCollections: TopERC721CollectionsType[] }>('/api/erc721-top-trending-collections', GenericFetcher, { refreshInterval: 50000 });
    
    // Conditionally render this component
    if (collectionsError){
        return <div className="text-red-500 p-4">Error Loading Top Collections Data...</div>
    }
    else if (loadingCollections) {
        return <div className="text-gray-300 p-4">Loading Top Collections Data...</div>
    }
    else {
        // Render component using the information provided
        return (
            <div className="p-4 bg-gray-900 mt-10 mt-10 shadow-lg">
                <h4 className="text-2xl font-bold mb-4 text-gray-100">Top Collections</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Logo</TableHead>
                            <TableHead className="text-gray-300">Floor Price</TableHead>
                            <TableHead className="text-gray-300">24 Hour Price % Change</TableHead>
                            <TableHead className="text-gray-300">Volume</TableHead>
                            <TableHead className="text-gray-300">24 Hour Volume % Change</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections?.topCollections.map((collection, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">{collection.collection_title}</TableCell>
                                <TableCell className="text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <Image unoptimized alt={`${collection.collection_image} logo`} height={20} width={20} src={collection.collection_image} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-300">{"$" + collection.floor_price_usd}</TableCell>
                                <TableCell className={Number(collection.floor_price_usd_24hr_percent_change) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Number(collection.floor_price_usd_24hr_percent_change) >= 0 ? '+' + Number(collection.floor_price_usd_24hr_percent_change).toFixed(2) + '%' : Number(collection.floor_price_usd_24hr_percent_change).toFixed(2) + "%"}
                                </TableCell>
                                <TableCell className="text-gray-300">{"$" + collection.volume_usd}</TableCell>
                                <TableCell className={Number(collection.volume_24hr_percent_change) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {Number(collection.volume_24hr_percent_change) >= 0 ? '+' + Number(collection.volume_24hr_percent_change).toFixed(2) + '%' : Number(collection.volume_24hr_percent_change).toFixed(2) + "%"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}