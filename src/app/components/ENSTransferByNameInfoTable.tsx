'use client';

import ENSTransfersByNameType from "../utils/types/ENSTransfersByNameType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ENS Transfer By Name Info Table Component
export default function ENSTransferByNameInfoTable(props: { data: ENSTransfersByNameType[] }) {
    const { data } = props;

    // Render ENS Transfers By Name Info Table
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">ENS Transfers</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Time Stamp</TableHead>
                        <TableHead className="text-gray-300">Category</TableHead>
                        <TableHead className="text-gray-300">From</TableHead>
                        <TableHead className="text-gray-300">To</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((transfer, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{String(transfer.timestamp).split("T")[0]}</TableCell>
                            <TableCell className="text-gray-300">{transfer.category}</TableCell>
                            <TableCell className="text-gray-300">{transfer.from === null ? 'N/A' : transfer.from}</TableCell>
                            <TableCell className="text-gray-300">{transfer.to === null ? 'N/A' : transfer.to}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   