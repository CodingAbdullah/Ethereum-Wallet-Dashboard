'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC20CollectionTransfersType from "../utils/types/ERC20CollectionTransfersType";

// Custom ERC20 Collection Transfers Info Table Component
export default function ERC20collectionOwnersInfoTable(props: { address: string }) {
    const { address } = props;

    // Make API call upon loading the custom component
    const { data, error, isLoading } = useSWR(['/api/erc20-transfer', { contract: address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });
    
    // Conditionally render the info table 
    if (isLoading) {
        return <div>Loading ERC20 Collection Transfers Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc20CollectionTransfersData: ERC20CollectionTransfersType[] = data.result;

        // Render ERC20 Collection Transfers Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Collection Transfers</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Date</TableHead>
                            <TableHead className="text-gray-300">From</TableHead>
                            <TableHead className="text-gray-300">To</TableHead>
                            <TableHead className="text-gray-300">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {
                        erc20CollectionTransfersData.map((transfer, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{String(transfer.block_timestamp).split(".")[0]}</TableCell>
                                <TableCell className="text-gray-300">{transfer.from_address}</TableCell>
                                <TableCell className="text-gray-300">{transfer.to_address}</TableCell>
                                <TableCell className="text-gray-300">{transfer.value_decimal}</TableCell>
                            </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}   