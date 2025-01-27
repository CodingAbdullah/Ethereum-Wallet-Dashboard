"use client";

import useSWR from "swr";
import GenericFetcher from "@/app/utils/functions/GenericFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import ValidatorLeaderboardType from "../utils/types/ValidatorLeaderboardType";

// Validator Leaderboard Info Table Component
export default function ValidatorLeaderboardInfoTable() {
    const validatorLeaderboardData = useSWR<{ information: { data : ValidatorLeaderboardType[] }}>('/api/validator-leaderboard-data', GenericFetcher, { refreshInterval: 50000 });
    const { data: validatorData, error, isLoading } = validatorLeaderboardData;

    // Conditionally render the Validator Leaderboard Info Table Component
    if (error) {
        throw new Error();
    }
    else if (isLoading){
        return <div>Loading data...</div>
    }
    else {
        // Render the Validator Leaderboard Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-5 mb-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Validator Leaderboard Statistics</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Balance</TableHead>
                            <TableHead className="text-gray-300">Performance Last Day</TableHead>
                            <TableHead className="text-gray-300">Performance Last 7 Days</TableHead>
                            <TableHead className="text-gray-300">Performance Last 30 Days</TableHead>
                            <TableHead className="text-gray-300">Performance Last Year</TableHead>
                            <TableHead className="text-gray-300">Performance Total</TableHead>
                            <TableHead className="text-gray-300">Rank Last 7 Days</TableHead>
                            <TableHead className="text-gray-300">Validator Index</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            validatorData?.information?.data?.map((metric, index: number) => {
                                return (
                                    <TableRow key={index} className="border-b border-gray-800">
                                        <TableCell className="font-medium text-gray-100">{metric.balance}</TableCell>
                                        <TableCell className="text-gray-300">{metric.performance1d}</TableCell>
                                        <TableCell className="font-medium text-gray-100">{metric.performance7d}</TableCell>
                                        <TableCell className="text-gray-300">{metric.performance31d}</TableCell>
                                        <TableCell className="font-medium text-gray-100">{metric.performance365d}</TableCell>
                                        <TableCell className="text-gray-300">{metric.performancetotal}</TableCell>
                                        <TableCell className="text-gray-300">{metric.rank7d}</TableCell>
                                        <TableCell className="text-gray-300">{metric.validatorindex}</TableCell>
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