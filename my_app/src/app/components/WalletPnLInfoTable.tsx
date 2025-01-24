'use client';

import useSWR from "swr";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import PostFetcher from "../utils/functions/PostFetcher";
import WalletPnLInfoType from "../utils/types/WalletPnLInfoType";

// Custom Wallet PnL Info Table Component
export default function WalletPnLInfoTable(props: { address: string } ) {
    const { address } = props;
    const {data, error: walletPnLError, isLoading: loadingWalletPnL } = useSWR(['/api/wallet-pnl-data', { address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render Wallet PnL Info Table Component
    if (loadingWalletPnL) {
        return <div>Loading Wallet PnL Info Table Component...</div>
    }
    else if (walletPnLError) {
        throw new Error();
    }
    else {
        const walletPnLData: WalletPnLInfoType = data;

        // Render Wallet PnL Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Wallet PnL Data</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">PnL</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Trade Count</TableCell>
                            <TableCell className="text-gray-300">{walletPnLData.total_count_of_trades}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Trade Volume</TableCell>
                            <TableCell className="text-gray-300">{"$" + walletPnLData.total_trade_volume}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Realized Profit (USD)</TableCell>
                            <TableCell className={Number(walletPnLData.total_realized_profit_usd) < 0 ? 'text-red-500' : 'text-green-500'}>
                                {Number(walletPnLData.total_realized_profit_usd) < 0 ? '-$' : '+$'}{Math.abs(Number(walletPnLData.total_realized_profit_usd)).toFixed(2)}
                            </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Realized Profit Percentage</TableCell>
                            <TableCell className={Number(walletPnLData.total_realized_profit_percentage) < 0 ? 'text-red-500' : 'text-green-500'}>
                                {Number(walletPnLData.total_realized_profit_percentage) < 0 ? '' : '+'}{Number(walletPnLData.total_realized_profit_percentage).toFixed(2) + "%"}
                            </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Buys</TableCell>
                            <TableCell className="text-gray-300">{walletPnLData.total_buys}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Sells</TableCell>
                            <TableCell className="text-gray-300">{walletPnLData.total_sells}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Sold Volume (USD)</TableCell>
                            <TableCell className="text-gray-300">{"$" + Number(walletPnLData.total_sold_volume_usd).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-300">Total Bought Volume (USD)</TableCell>
                            <TableCell className="text-gray-300">{"$" + Number(walletPnLData.total_bought_volume_usd).toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}   