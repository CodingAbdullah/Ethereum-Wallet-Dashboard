'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

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

        // Spread out, in an array, the attributes of the particular collection
        const attributes = [...Object.keys(data.information.data.summary)]; 

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
                        {
                            attributes?.map((attribute, index) => {
                                return (
                                    <TableRow key={index} className="border-b border-gray-800">
                                        <TableCell className="text-gray-300">{attribute}</TableCell>
                                        <TableCell className="text-gray-300">
                                            <code>
                                                {JSON.stringify(erc721CollectionAttributeData[attribute])}
                                            </code>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        )
    }
}