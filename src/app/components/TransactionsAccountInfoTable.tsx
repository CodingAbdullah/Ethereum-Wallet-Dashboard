"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TransactionsAccountInformationType from "../utils/types/TransactionsAccountInformationType";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';
import PostFetcher from "../utils/functions/PostFetcher";
import useSWR from "swr";

// Transactions Account Information Table Custom Component
export default function TransactionsAccountInfoTable( props : { address: string }) {
    const { address } = props;

    // useSWR hook for enabling API request call
    const { data, error: transactionAccountError, isLoading: loadingAccountTransactions } = 
    useSWR<TransactionsAccountInformationType>(['/api/address-transaction-amount', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render component
    if (loadingAccountTransactions) {
        return <div>Loading Account Transactions Table...</div>
    }
    else if (transactionAccountError) {
        throw new Error();
    }
    else {
        // Render Account Transactions Activity
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Account Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">ETH Price</TableHead>
                            <TableHead className="text-gray-300">ETH Balance</TableHead>
                            <TableHead className="text-gray-300">USD Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-100">{data?.ethPrice}</TableCell>
                            <TableCell className="text-gray-300">{data?.ethBalance}</TableCell>
                            <TableCell className="text-gray-300">{data?.usdValue}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}
