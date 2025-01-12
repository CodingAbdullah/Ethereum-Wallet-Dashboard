"use client";

import useSWR from "swr";
import NavbarFetcher from "../utils/functions/NavbarFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

// Generic Gas Metrics Info Table Component
export default function GenericGasMetricsInfoTable() {
    const gasMetricsInfo = useSWR('api/gas-track', NavbarFetcher, { refreshInterval: 30000 });
    const { data, error, isLoading } = gasMetricsInfo;

    // Conditionally render the Generic Gas Metrics Info Table Component
    if (error) {
        throw new Error();
    }
    else if (isLoading){
        return <div>Loading data...</div>
    }
    else {
        
        // Render the Gas Tracker Page Component using the generic gas data and gas block data
        const { currentBlockNumber, maxPrice, msSinceLastBlock, network, system, unit } = data;
        
        // Render Generic Gas Metrics Info Table
        return (
            <div className="p-4 bg-gray-900 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">General Network Metrics</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">General Metrics</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={system} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">System</TableCell>
                            <TableCell className="text-gray-300">{String(system).charAt(0).toUpperCase() + system.substring(1)}</TableCell>
                        </TableRow>
                        <TableRow key={network} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Network</TableCell>
                            <TableCell className="text-gray-300">{network.charAt(0).toUpperCase() + network.substring(1)}</TableCell>
                        </TableRow>
                        <TableRow key={maxPrice} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Max Price</TableCell>
                            <TableCell className="text-gray-300">{maxPrice + " GWei"}</TableCell>
                        </TableRow>
                        <TableRow key={unit} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Unit</TableCell>
                            <TableCell className="text-gray-300">{String(unit).charAt(0).toUpperCase() + String(unit).substring(1)}</TableCell>
                        </TableRow>
                        <TableRow key={currentBlockNumber} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Current Block Number</TableCell>
                            <TableCell className="text-gray-300">{currentBlockNumber}</TableCell>
                        </TableRow>
                        <TableRow key={msSinceLastBlock} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">MsSince Last Block</TableCell>
                            <TableCell className="text-gray-300">{msSinceLastBlock}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}