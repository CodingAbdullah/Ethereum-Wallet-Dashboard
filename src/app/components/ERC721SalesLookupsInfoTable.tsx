'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721SalesLookupInfoType from "../utils/types/ERC721SalesLookupInfoType";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// Custom ERC721 Sales Lookups Info Table Component
export default function ERC721SalesLookupsInfoTable(props: { address: string, tokenID: string, network: string }) {
    const { address, tokenID } = props;

    // Make API call upon loading the custom component
    const { data, error, isLoading } = 
    useSWR<{ information: { results: ERC721SalesLookupInfoType[] }}>(['/api/erc721-sales-by-id', { address, id: tokenID }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });
    
    // Conditionally render the Info Table 
    if (isLoading) {
        return <div>Loading ERC721 Token Sales Lookup Info Table Component</div>
    }
    else if (error) {
        throw new Error();
    }
    else {

        // Render ERC721 Sales Lookup Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Token Sales History</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Date</TableHead>
                            <TableHead className="text-gray-300">Exchange Name</TableHead>
                            <TableHead className="text-gray-300">ETH Value</TableHead>
                            <TableHead className="text-gray-300">USD Value</TableHead>
                            <TableHead className="text-gray-300">Buyer</TableHead>
                            <TableHead className="text-gray-300">Seller</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.information?.results.map((transfer, index: number) => (
                            <TableRow key={index} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{String(transfer.timestamp).split("T")[0]}</TableCell>
                                <TableCell className="text-gray-300">{transfer.exchange_name + '-' + transfer.contract_version}</TableCell>
                                <TableCell className="text-gray-300">{transfer.eth_price}</TableCell>
                                <TableCell className="text-gray-300">{"$" + transfer.usd_price}</TableCell>
                                <TableCell className="text-gray-300">{transfer.buyer === null ? 'N/A' : transfer.buyer}</TableCell>
                                <TableCell className="text-gray-300">{transfer.seller === null ? 'N/A' : transfer.seller}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}   