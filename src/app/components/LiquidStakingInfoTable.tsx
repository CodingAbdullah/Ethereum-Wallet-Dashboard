"use client";

import useSWR from "swr";
import GenericFetcher from "@/app/utils/functions/GenericFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import LiquidStakingType from "../utils/types/LiquidStakingType";

const formatNumber = (value: number | null, digits = 2) =>
    value === null ? 'N/A' : value.toLocaleString('en-US', { maximumFractionDigits: digits });

// Liquid Staking Info Table Component
export default function LiquidStakingInfoTable() {
    const { data, error, isLoading } = useSWR<{ tokens: LiquidStakingType[] }>('/api/liquid-staking-data', GenericFetcher, { refreshInterval: 300000 });

    // Conditionally render the Liquid Staking Info Table Component
    if (isLoading) {
        return <div>Loading data...</div>
    }
    else if (error) {
        return <div className="p-4 text-red-400">Failed to load liquid staking data.</div>;
    }
    else {
        // Render the Liquid Staking Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-5 mb-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Liquid Staking Tokens</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Protocol</TableHead>
                            <TableHead className="text-gray-300">Token</TableHead>
                            <TableHead className="text-gray-300">ETH Staked</TableHead>
                            <TableHead className="text-gray-300">Exchange Rate (ETH)</TableHead>
                            <TableHead className="text-gray-300">APR</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.tokens?.map(token => (
                            <TableRow key={token.token} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">{token.protocol}</TableCell>
                                <TableCell className="text-gray-300">{token.token}</TableCell>
                                <TableCell className="text-gray-300">{formatNumber(token.eth_staked, 0)}</TableCell>
                                <TableCell className="text-gray-300">{formatNumber(token.exchange_rate, 4)}</TableCell>
                                <TableCell className="text-gray-300">{token.apr === null ? 'N/A' : token.apr.toFixed(2) + '%'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p className="mt-3 text-sm text-gray-500">APR for rETH and cbETH is the last 7 days of exchange-rate growth, annualized.</p>
            </div>
        )
    }
}
