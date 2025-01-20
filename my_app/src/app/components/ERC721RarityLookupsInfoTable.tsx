'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721RarityLookupType from "../utils/types/ERC721RarityLookupType";

// Custom ERC721 Rarity Lookups Info Table Component
export default function ERC721RarityLookupsInfoTable(props: { address: string, tokenID: string, network: string } ) {
    const { address, tokenID, network } = props;

    // Make API call upon loading the custom component
    const { data, error, isLoading } = useSWR(['/api/erc721-lookup-rarity-by-id', { address, id: tokenID, network }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 30000 });
    
    // Conditionally render the info table 
    if (isLoading) {
        return <div>Loading ERC721 Rarity Lookups Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const rarityData: ERC721RarityLookupType[] = data.information.data;
        
        // Render ERC721 Token Rarity Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC721 Token Rarity</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Value</TableHead>
                            <TableHead className="text-gray-300">Trait Type</TableHead>
                            <TableHead className="text-gray-300">Prevalence</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rarityData.map((trait, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{trait.value}</TableCell>
                                <TableCell className="text-gray-300">{trait.trait_type}</TableCell>
                                <TableCell className="text-gray-300">{(Number(trait.prevalence)*100).toFixed(2) + "%"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}   