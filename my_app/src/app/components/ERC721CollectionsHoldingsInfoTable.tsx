'use client';

import ERC721CollectionsHoldingsType from "../utils/types/ERC721CollectionsHoldingsType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ERC721 Collections Holdings Info Table Component
export default function ERC721CollectionsHoldingsInfoTable(props: { data: ERC721CollectionsHoldingsType[] } ) {
    const { data } = props;

    // Render ERC721 Collections Holdings Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC721 Collections Holdings</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Token Address</TableHead>
                        <TableHead className="text-gray-300">Contract Type</TableHead>
                        <TableHead className="text-gray-300">Verified Collection</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((collectionHolding, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{collectionHolding.name}</TableCell>
                            <TableCell className="text-gray-300">{collectionHolding.symbol}</TableCell>
                            <TableCell className="text-gray-300">{collectionHolding.token_address}</TableCell>
                            <TableCell className="text-gray-300">{collectionHolding.contract_type}</TableCell>
                            <TableCell className="text-gray-300">{collectionHolding.verified_collection ? 'YES' : 'NO'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   