'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC20CollectionOwnersType from "../utils/types/ERC20CollectionOwnersType";

// Custom ERC20 Collection Owners Info Table Component
export default function ERC20collectionOwnersInfoTable(props: { address: string } ) {
    const { address } = props;

    // Make API call upon loading the custom component
    const { data, error, isLoading } = useSWR(['/api/erc20-owners', { contract: address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 1000000000 });
    
    // Conditionally render the info table 
    if (isLoading) {
        return <div>Loading ERC20 Collection Owners Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc20CollectionOwnersData: ERC20CollectionOwnersType[] = data.result;

        // Render ERC721 Token Rarity Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC20 Collection Owners</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Owner</TableHead>
                            <TableHead className="text-gray-300">Token Balance</TableHead>
                            <TableHead className="text-gray-300">USD Value</TableHead>
                            <TableHead className="text-gray-300">Percentage of Supply</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {
                        erc20CollectionOwnersData.map((owner, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{owner.owner_address}</TableCell>
                                <TableCell className="text-gray-300">{owner.balance}</TableCell>
                                <TableCell className="text-gray-300">{"$" + Number(owner.usd_value).toFixed(2)}</TableCell>
                                <TableCell className="text-gray-300">{Number(owner.percentage_relative_to_total_supply).toFixed(2) + '%'}</TableCell>
                            </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}   