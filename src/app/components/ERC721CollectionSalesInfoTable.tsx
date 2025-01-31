'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import ERC721CollectionSalesInfoType from "../utils/types/ERC721CollectionSalesInfoType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// ERC721 Collection Sales Info Table Custom Component
export default function ERC721CollectionSalesInfoTable(props : { address: string }){
    const { address } = props;
    const { data, error, isLoading } = 
    useSWR(['/api/erc721-collection-sales', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render component
    if (isLoading) {
        return <div>Loading ERC721 Collection Sales Info Table...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc721CollectionSalesData: ERC721CollectionSalesInfoType[] = data.information.result;

        // Render the ERC721 Collection Sales Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Sales</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Date</TableHead>
                            <TableHead className="text-gray-300">Token ID</TableHead>
                            <TableHead className="text-gray-300">Buyer</TableHead>
                            <TableHead className="text-gray-300">Seller</TableHead>
                            <TableHead className="text-gray-300">Price (ETH)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {erc721CollectionSalesData?.map((sale, index: number) => {
                           return (
                                <TableRow key={index} className="border-b border-gray-800">
                                    <TableCell className="text-gray-300">{sale.block_timestamp.split(".")[0]}</TableCell>
                                    <TableCell className="text-gray-300">{sale.token_ids[0]}</TableCell>
                                    <TableCell className="text-gray-300">{sale.buyer_address}</TableCell>
                                    <TableCell className="text-gray-300">{sale.seller_address}</TableCell>
                                    <TableCell className="text-gray-300">{sale.price_formatted}</TableCell>
                                </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </div>
        )
    }
}
