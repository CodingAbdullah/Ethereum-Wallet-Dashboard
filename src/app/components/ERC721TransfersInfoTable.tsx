'use client';

import ERC721TransfersType from "../utils/types/ERC721TransfersType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ERC721 Transfers Info Table Component
export default function ERC721TransfersInfoTable(props: { data: ERC721TransfersType[], address: string }) {
    const { address, data } = props;

    // Render ERC721 Transfers Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Transfers</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Token Address</TableHead>
                        <TableHead className="text-gray-300">Token ID</TableHead>
                        <TableHead className="text-gray-300">From</TableHead>
                        <TableHead className="text-gray-300">To</TableHead>
                        <TableHead className="text-gray-300">Direction</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((tokenTransfer, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{tokenTransfer.block_timestamp.split("T")[0]}</TableCell>
                            <TableCell className="text-gray-300">{tokenTransfer.token_address}</TableCell>
                            <TableCell className="text-gray-300">{tokenTransfer.token_id}</TableCell>
                            <TableCell className="text-gray-300">{tokenTransfer.from_address}</TableCell>
                            <TableCell className="text-gray-300">{tokenTransfer.to_address}</TableCell>
                            <TableCell className={tokenTransfer.to_address === address ? 'text-green-500' : 'text-red-500'}>
                                {tokenTransfer.to_address === address ? "IN" : "OUT"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   