'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721CollectionFloorPriceInfoType from "../utils/types/ERC721CollectionFloorPriceInfoType";
import Link from "next/link";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// ERC721 Collection Floor Price Info Table Custom Component
export default function ERC721CollectionFloorPriceInfoTable(props : { address: string }){
    const { address } = props;
    const { data, error, isLoading } = 
    useSWR(['/api/erc721-collection-floor-price', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render component
    if (isLoading) {
        return <div>Loading ERC721 Collection Floor Price Info Table...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const floorPriceData: ERC721CollectionFloorPriceInfoType = data.information.data;

        // Render the ERC721 Collection Floor Price Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Floor Price Data</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Market Place</TableHead>
                            <TableHead className="text-gray-300">Floor Price</TableHead>
                            <TableHead className="text-gray-300">Currency</TableHead>
                            <TableHead className="text-gray-300">Retrieval Date</TableHead>
                            <TableHead className="text-gray-300">URL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        { Object.keys(floorPriceData).map((marketplace, index: number) => {
                            return (
                                <TableRow key={index} className="border-b border-gray-800">
                                    <TableCell className="text-gray-300">{marketplace}</TableCell>
                                    <TableCell className="text-gray-300">{floorPriceData[marketplace]?.floorPrice}</TableCell>
                                    <TableCell className="text-gray-300">{floorPriceData[marketplace]?.priceCurrency}</TableCell>
                                    <TableCell className="text-gray-300">{floorPriceData[marketplace]?.retrievedAt?.split('.')[0]}</TableCell>
                                    <TableCell className="text-gray-300">
                                        <Link target="_blank" href={ marketplace === 'openSea' ? 'https://opensea.io/assets/ethereum/' + address : 'https://looksrare.org/collections/' + address }>
                                            <u>Market Place Link</u>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </div>
        )
    }
}