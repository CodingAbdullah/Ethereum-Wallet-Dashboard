'use client';

import useSWR from "swr";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import PostFetcher from "../utils/functions/PostFetcher";
import WalletPnLBreakdownInfoType from "../utils/types/WalletPnLBreakdownInfoType";
import Image from "next/image";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// Custom Wallet PnL Breakdown Info Table Component
export default function WalletPnLBreakdownInfoTable(props: { address: string }) {
    const { address } = props;
    const { data, error: walletPnLBreakdownError, isLoading: loadingWalletPnLBreakdownData } = 
    useSWR(['/api/wallet-pnl-breakdown-data', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render Wallet PnL Breakdown Info Table Component
    if (loadingWalletPnLBreakdownData) {
        return <div>Loading Wallet PnL Breakdown Info Table Component...</div>
    }
    else if (walletPnLBreakdownError) {
        throw new Error();
    }
    else {
        const walletPnLBreakdownData: WalletPnLBreakdownInfoType = data;

        // Render Wallet PnL Breakdown Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Wallet PnL Breakdown Data</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Name</TableHead>
                            <TableHead className="text-gray-300">Logo</TableHead>
                            <TableHead className="text-gray-300">Token Address</TableHead>
                            <TableHead className="text-gray-300">Total Invested (USD)</TableHead>
                            <TableHead className="text-gray-300">Total Sold (USD)</TableHead>
                            <TableHead className="text-gray-300">Trade Count</TableHead>
                            <TableHead className="text-gray-300">Realized Profit (USD)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            walletPnLBreakdownData?.result?.map((pnl, index:number) => {
                                return (
                                    <TableRow key={index} className="border-b border-gray-800">
                                        <TableCell className="text-gray-300">{pnl.name}</TableCell>
                                        <TableCell className="text-gray-300">
                                            <div className="flex items-center space-x-2">
                                                <Image alt={`${pnl.symbol} logo`} height={15} width={15} src={pnl.logo} />
                                                <span>{pnl.symbol}</span>
                                            </div>
                                        </TableCell>                                        
                                        <TableCell className="text-gray-300">{pnl.token_address}</TableCell>
                                        <TableCell className="text-gray-300">{"$" + Number(pnl.total_usd_invested).toFixed(2)}</TableCell>
                                        <TableCell className="text-gray-300">{'$' + Number(pnl.total_sold_usd).toFixed(2)}</TableCell>
                                        <TableCell className="text-gray-300">{pnl.count_of_trades}</TableCell>
                                        <TableCell className={Number(pnl.realized_profit_usd) < 0 ? 'text-red-500' : 'text-green-500'}>
                                            {Number(pnl.realized_profit_usd) < 0 ? '-$' : '+$'}{Math.abs(Number(pnl.realized_profit_usd)).toFixed(2)}
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