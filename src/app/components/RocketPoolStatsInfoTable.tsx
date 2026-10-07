"use client";

import useSWR from "swr";
import GenericFetcher from "@/app/utils/functions/GenericFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import RocketPoolStatsType from "../utils/types/RocketPoolStatsType";

const num = (value: number | null | undefined, digits = 2) =>
    value === null || value === undefined ? 'N/A' : value.toLocaleString('en-US', { maximumFractionDigits: digits });
const pct = (value: number | null | undefined) => (value === null || value === undefined ? 'N/A' : value.toFixed(2) + '%');

// Rocket Pool Stats Info Table Component
export default function RocketPoolStatsInfoTable() {
    const rocketPoolStatsData = useSWR<RocketPoolStatsType>('/api/rocket-pool-stats', GenericFetcher, { refreshInterval: 50000 });
    const { data: poolData, error, isLoading } = rocketPoolStatsData;

    // Conditionally render the Rocket Pool Stats Info Table Component
    if (error) {
        return <div className="p-4 text-red-400">Failed to load Rocket Pool statistics.</div>;
    }
    else if (isLoading){
        return <div>Loading data...</div>
    }
    else {
        const stats = poolData?.information?.data;

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
                        <TableRow key="Node Fee" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Node Fee</TableCell>
                            <TableCell className="text-gray-300">{pct(stats?.current_node_fee)}</TableCell>
                        </TableRow>
                        <TableRow key="Node Count" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Node Count</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.node_count, 0)}</TableCell>
                        </TableRow>
                        <TableRow key="Minipool Count" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Minipool Count</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.minipool_count, 0)}</TableCell>
                        </TableRow>
                        <TableRow key="rETH APR (7 day)" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rETH APR (7 day)</TableCell>
                            <TableCell className="text-gray-300">{pct(stats?.reth_apr)}</TableCell>
                        </TableRow>
                        <TableRow key="rETH Exchange Rate" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rETH Exchange Rate</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.reth_exchange_rate, 4) + ' ETH'}</TableCell>
                        </TableRow>
                        <TableRow key="rETH Supply" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">rETH Supply</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.reth_supply, 0)}</TableCell>
                        </TableRow>
                        <TableRow key="RPL Price" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">RPL Price</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.rpl_price, 5) + ' ETH'}</TableCell>
                        </TableRow>
                        <TableRow key="Total ETH Balance" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Total ETH Balance</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.total_eth_balance, 0) + ' ETH'}</TableCell>
                        </TableRow>
                        <TableRow key="Total ETH Staking" className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Total ETH Staking</TableCell>
                            <TableCell className="text-gray-300">{num(stats?.total_eth_staking, 0) + ' ETH'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}