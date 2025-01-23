'use client';

import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import WalletBalanceInfoType from "../utils/types/WalletBalanceInfoType";

// Custom Transaction Balance Info Table Component
export default function TransactionBalanceInfoTable(props: { address: string, network: string } ) {
    const { address, network } = props;

    // Make API call upon loading the custom component
    const { data, error: walletBalanceError, isLoading: loadingWalletBalance } = useSWR(['/api/address-net-worth', { address, network }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });
    
    // Conditionally render the info table 
    if (loadingWalletBalance) {
        return <div>Loading Transaction Balance Info Table Component</div>
    }
    else if (walletBalanceError) {
        throw new Error();
    }
    else {
        const walletBalanceData: WalletBalanceInfoType = data;

        // Render Transaction Balance Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Wallet Balance</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">ETH Balance</TableHead>
                            <TableHead className="text-gray-300">USD Value</TableHead>
                            <TableHead className="text-gray-300">Token USD Value</TableHead>
                            <TableHead className="text-gray-300">Wallet Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{walletBalanceData.chains[0].native_balance_formatted + ' ETH'}</TableCell>
                            <TableCell className="text-gray-300">{"$" + walletBalanceData.chains[0].native_balance_usd}</TableCell>
                            <TableCell className="text-gray-300">{"$" + walletBalanceData.chains[0].token_balance_usd}</TableCell>
                            <TableCell className="text-gray-300">{"$" + walletBalanceData.total_networth_usd}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}   