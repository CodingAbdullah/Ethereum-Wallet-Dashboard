'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721CollectionDataType from "../utils/types/ERC721CollectionDataType";

// ERC721 Collection Data Info Table Custom Component
export default function ERC721CollectionDataInfoTable(props: { address: string }){
    const { address } = props;
    const {data, error, isLoading } = useSWR(['/api/erc721-collection-data', { address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 1000000000 });

    // Conditionally render component
    if (isLoading) {
        return <div>Loading ERC721 Collection Data Info Table...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc721CollectionData: ERC721CollectionDataType = data.information.result[0];

        // Render ERC721 Opensea Token Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC721 Collection Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Symbol</TableHead>
                            <TableHead className="text-gray-300">Contract Type</TableHead>
                            <TableHead className="text-gray-300">Token Address</TableHead>
                            <TableHead className="text-gray-300">Verified Collection</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{erc721CollectionData.name}</TableCell>
                            <TableCell className="text-gray-300">{erc721CollectionData.symbol}</TableCell>
                            <TableCell className="text-gray-300">{erc721CollectionData.contract_type}</TableCell>
                            <TableCell className="text-gray-300">{erc721CollectionData.token_address}</TableCell>
                            <TableCell className="text-gray-300">{erc721CollectionData.verified_collection ? "YES" : "NO"}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}