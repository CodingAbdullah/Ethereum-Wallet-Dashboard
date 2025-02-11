'use client';

import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";

// Etherscan Info Table Component
export default function EtherscanInfoTable(props: { address: string }) {
    const { address } = props;
    
    // Render Etherscan Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Etherscan Information</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow key={1} className="border-b border-gray-800">
                        <TableCell className="text-gray-300">
                            <Link href={'https://etherscan.io/token/' + address } target="_blank">
                                <u>{'https://etherscan.io/token/' + address }</u>
                            </Link>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}