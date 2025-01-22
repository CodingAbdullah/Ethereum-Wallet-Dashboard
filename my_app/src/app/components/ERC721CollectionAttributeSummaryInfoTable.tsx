'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721CollectionAttributeType from "../utils/types/ERC721CollectionAttributeType";

// ERC721 Collection Attribute Summary Info Table Custom Component
export default function ERC721CollectionAttributeSummaryInfoTable(props: { address: string }){
    const { address } = props;
    const { data, error, isLoading } = useSWR(['/api/erc721-collection-attributes', { address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 1000000000 });

    // Conditionally render component
    if (isLoading) {
        return <div>Loading ERC721 Collection Attribute Summary Info Table...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc721CollectionAttributeData = data.information.data.summary;
        console.log(erc721CollectionAttributeData);

        // Render Attributes Summary Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Attributes Summary</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Trait</TableHead>
                            <TableHead className="text-gray-300">Type & Count</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}