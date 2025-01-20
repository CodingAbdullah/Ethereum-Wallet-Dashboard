'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import ERC721OpenseaTokenLookupInfoType from "../utils/types/ERC721OpenseaTokenLookupInfoType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ERC721 Opensea Token Lookup Info Table Component
export default function ERC721OpenseaTokenLookupInfoTable(props: { address: string, network: string, tokenID: string } ) {
    const { address, network, tokenID } = props;

    // Make API call upon loading the custom component
    const {data, error, isLoading } = useSWR(['/api/erc721-lookup-opensea-information', { address, network, id: tokenID }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 30000 });
    
    // Conditionally render the Info Table 
    if (isLoading) {
        return <div>Loading ERC721 Opensea Token Lookup Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const openseaInformation: ERC721OpenseaTokenLookupInfoType = data.information.nft;

        // Render ERC721 Opensea Token Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Opensea Token Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Metric</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Name</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.name}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Token Standard</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.token_standard.toUpperCase()}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Creator Address</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.creator}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Owner Address</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.owners[0].address}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Rarity Rank</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.rarity.rank}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Suspicious?</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.is_suspicious ? "YES" : "NO"}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Updated At</TableCell>
                            <TableCell className="text-gray-300">{openseaInformation.updated_at.split(".")[0]}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}   