"use client";

import useSWR from "swr";
import GenericFetcher from "@/app/utils/functions/GenericFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import RocketPoolStatsType from "../utils/types/RocketPoolStatsType";

// Rocket Pool Stats Info Table Component
export default function RocketPoolStatsInfoTable() {
    const rocketPoolStatsData = useSWR<RocketPoolStatsType>('/api/rocket-pool-stats', GenericFetcher, { refreshInterval: 50000 });
    const { data: poolData, error, isLoading } = rocketPoolStatsData;

    // Conditionally render the Rocket Pool Stats Info Table Component
    if (error) {
        throw new Error();
    }
    else if (isLoading){
        return <div>Loading data...</div>
    }
    else {
        const tableData = poolData?.information;

        // Render the Rocket Pool Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-5 mb-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Rocket Pool Statistics</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">General Metrics</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={1} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Node Fee</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.current_node_fee}</TableCell>
                        </TableRow>
                        <TableRow key={2} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Node Count</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.node_count}</TableCell>
                        </TableRow>
                        <TableRow key={3} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Minipool Count</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.minipool_count}</TableCell>
                        </TableRow>
                        <TableRow key={4} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rocketETH APR</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.reth_apr}</TableCell>
                        </TableRow>
                        <TableRow key={5} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rocketETH Exchange Rate</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.reth_exchange_rate}</TableCell>
                        </TableRow>
                        <TableRow key={6} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rocketEth Supply</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.reth_supply}</TableCell>
                        </TableRow>
                        <TableRow key={7} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rocketEth Supply</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.reth_supply}</TableCell>
                        </TableRow>
                        <TableRow key={8} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Price</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.rpl_price}</TableCell>
                        </TableRow>
                        <TableRow key={9} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Total ETH Staking</TableCell>
                            <TableCell className="text-gray-300">{tableData?.data?.total_eth_staking}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}