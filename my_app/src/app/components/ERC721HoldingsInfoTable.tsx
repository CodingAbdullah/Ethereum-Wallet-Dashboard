'use client';

import ERC721HoldingsType from "../utils/types/ERC721HoldingsType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";

// Custom ERC721 Holdings Info Table Component
export default function ERC721HoldingsInfoTable(props: { data: ERC721HoldingsType[] } ) {
    const { data } = props;
    console.log(data);
    // Render ERC721 Holdings Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC721 Holdings</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Contract Type</TableHead>
                        <TableHead className="text-gray-300">Token Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((tokenHolding, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{tokenHolding.name}</TableCell>
                            <TableCell className="text-gray-300">{tokenHolding.contract_type}</TableCell>
                            <TableCell className="text-gray-300">
                                <Link target="_blank" href={'https://opensea.io/assets/ethereum/' + tokenHolding.token_address + '/' + tokenHolding.token_id }>
                                    <u>{tokenHolding.name + ' - Link'}</u>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   