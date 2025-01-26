'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721TransfersType from "../utils/types/ERC721TransfersType";

// Custom ERC721 Transfer Lookups Info Table Component
export default function ERC721TransferLookupsInfoTable(props: { address: string, tokenID: string, network: string }) {
    const { address, tokenID, network } = props;

    // Make API call upon loading the custom component
    const { data, error, isLoading } = useSWR<{ information: { result: ERC721TransfersType[] }}>(['/api/erc721-lookup-transfer-by-id', { address, id: tokenID, network }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });
    
    // Conditionally render the info table 
    if (isLoading) {
        return <div>Loading ERC721 Token Transfers Lookup Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {

        // Render ERC721 Token Transfers Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Token Transfers</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Date</TableHead>
                            <TableHead className="text-gray-300">From</TableHead>
                            <TableHead className="text-gray-300">To</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.information?.result.map((transfer, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{String(transfer.block_timestamp).split(".")[0]}</TableCell>
                                <TableCell className="text-gray-300">{transfer.from_address}</TableCell>
                                <TableCell className="text-gray-300">{transfer.to_address}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}   