'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import ERC721LookupsInfoType from "../utils/types/ERC721LookupsInfoType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";

// Custom ERC721 Lookups Info Table Component
export default function ERC721LookupsInfoTable(props: { address: string, network: string, tokenID: string } ) {
    const { address, network, tokenID } = props;

    const {data, error, isLoading } = useSWR(['/api/erc721-lookup-by-id', { address, network, id: tokenID }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 30000 });
    
    if (isLoading) {
        return <div>Loading ERC721 Lookups Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc721LookupsData: ERC721LookupsInfoType = data.information;

        // Render ERC721 Lookups Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC721 Lookup Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Collection Name</TableHead>
                            <TableHead className="text-gray-300">Token ID</TableHead>
                            <TableHead className="text-gray-300">Token Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{erc721LookupsData.name}</TableCell>
                            <TableCell className="text-gray-300">{erc721LookupsData.token_id}</TableCell>
                            <TableCell className="text-gray-300">
                                <Link href={'https://opensea.io/assets/ethereum/' + address + '/' + tokenID } target="_blank">
                                    <u>Opensea Link</u>
                                </Link>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}   