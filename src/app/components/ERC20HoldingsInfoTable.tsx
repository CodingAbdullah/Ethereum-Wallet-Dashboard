'use client';

import ERC20HoldingsType from "../utils/types/ERC20HoldingsType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";

// Custom ERC20 Holdings Info Table Component
export default function ERC20HoldingsInfoTable(props: { data: ERC20HoldingsType[] }) {
    const { data } = props;

    // Render ERC20 Holdings Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Holdings</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Token Address</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                        <TableHead className="text-gray-300">Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((transfer, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{String(transfer.name)}</TableCell>
                            <TableCell className="text-gray-300">{transfer.token_address}</TableCell>
                            <TableCell className="text-gray-300">{transfer.symbol}</TableCell>
                            <TableCell className="text-gray-300">{transfer.balance}</TableCell>
                            <TableCell className="text-gray-300">
                                <Link target="_blank" href={ 'https://etherscan.io/token/' + transfer.token_address }>
                                    <u>Etherscan Link</u>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   