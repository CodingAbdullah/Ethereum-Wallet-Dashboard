'use client';

import ERC20TransfersType from "../utils/types/ERC20TransfersType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ERC20 Transfers Info Table Component
export default function ERC20TransfersInfoTable(props: { data: ERC20TransfersType[], address: string } ) {
    const { data, address } = props;

    // Render ERC20 Transfers Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC20 Transfers</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">From</TableHead>
                        <TableHead className="text-gray-300">To</TableHead>
                        <TableHead className="text-gray-300">Direction</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((transfer, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{String(transfer.block_timestamp).split("T")[0]}</TableCell>
                            <TableCell className="text-gray-300">{transfer.from_address}</TableCell>
                            <TableCell className="text-gray-300">{transfer.to_address === null ? 'N/A' : transfer.to_address}</TableCell>
                            <TableCell className={transfer.to_address === address ? 'text-green-500' : 'text-red-500'}>{transfer.to_address === address ? "IN" : "OUT"}</TableCell>
                            <TableCell className="text-gray-300">{transfer.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   