"use client";

import useSWR from "swr";
import GenericFetcher from "@/app/utils/functions/GenericFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import GasBlockInfoType from "../utils/types/GasBlockInfoType";

// Gas Block Info Table Custom Component
export default function GasBlockInfoTable() {
    const gasMetricsInfo = useSWR('/api/navbar/gas-track', GenericFetcher, { refreshInterval: 100000 });
    const { data, error, isLoading } = gasMetricsInfo;

    // Conditionally render the Gas Block Info Table Component
    if (isLoading) {
        return <div>Loading Gas Block Data...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const gasBlockData: GasBlockInfoType[] = data.blockPrices[0].estimatedPrices;
        
        // Render the Gas Block Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Gas Block Metrics</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Confidence</TableHead>
                            <TableHead className="text-gray-300">Price (GWei)</TableHead>
                            <TableHead className="text-gray-300">Max Priority Fee Per Gas</TableHead>
                            <TableHead className="text-gray-300">Max Fee Per Gas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            gasBlockData?.map(block => (
                            <TableRow key={block.confidence} className="border-b border-gray-800">
                                <TableCell className="text-gray-300">{block.confidence}</TableCell>
                                <TableCell className="text-gray-300">{block.price}</TableCell>
                                <TableCell className="text-gray-300">{block.maxPriorityFeePerGas}</TableCell>
                                <TableCell className="text-gray-300">{block.maxFeePerGas}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}