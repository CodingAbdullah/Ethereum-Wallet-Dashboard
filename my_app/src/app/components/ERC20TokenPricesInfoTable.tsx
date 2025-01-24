'use client';

import ERC20TokenInformationSectionType from "../utils/types/ERC20TokenInformationType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

// Custom ERC20 Holdings Info Table Component
export default function ERC20TokenPricesInfoTable(props: { data: ERC20TokenInformationSectionType }) {
    const { data } = props;
    
    // Render ERC20 Holdings Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">ERC20 Token Pricing Data</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Market Data Attribute</TableHead>
                        <TableHead className="text-gray-300">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Symbol</TableCell>
                        <TableCell className="text-gray-300">{data.symbol.toUpperCase()}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Last Updated</TableCell>
                        <TableCell className="text-gray-300">{data.last_updated.split(".")[0]}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Home Page</TableCell>
                        <TableCell className="text-gray-300">{data.links.homepage[0]}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Chat Apps</TableCell>
                        <TableCell className="text-gray-300">{data.links.chat_url[0]}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Twitter Handle</TableCell>
                        <TableCell className="text-gray-300">{data.links.twitter_screen_name}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Current Price</TableCell>
                        <TableCell className="text-gray-300">{"$" + data.market_data.current_price.usd}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">High 24 Hour Price</TableCell>
                        <TableCell className="text-gray-300">{'$' + data.market_data.high_24h.usd}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Low 24 Hour Price</TableCell>
                        <TableCell className="text-gray-300">{'$' + data.market_data.low_24h.usd}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">24 Hour Price Percentage Change</TableCell>
                        <TableCell className={data.market_data.price_change_24h < 0 ? 'text-red-500' : 'text-green-500'}>
                            {data.market_data.price_change_24h > 0 ? ' +' + data.market_data.price_change_24h + '%' : data.market_data.price_change_24h + '%'}
                        </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Total Volume</TableCell>
                        <TableCell className="text-gray-300">{"$" + data.market_data.total_volume.usd}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">All Time Low</TableCell>
                        <TableCell className="text-gray-300">{"$" + Number(data.market_data.atl.usd)}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">All Time Low Date</TableCell>
                        <TableCell className="text-gray-300">{data.market_data.atl_date.usd.split(".")[0]}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">All Time High</TableCell>
                        <TableCell className="text-gray-300">{'$' + Number(data.market_data.ath.usd)}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">All Time High Date</TableCell>
                        <TableCell className="text-gray-300">{data.market_data.ath_date.usd.split(".")[0]}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Total Supply</TableCell>
                        <TableCell className="text-gray-300">{data.market_data.total_supply}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Max Supply</TableCell>
                        <TableCell className="text-gray-300">{data.market_data.max_supply}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-gray-800">
                        <TableCell className="text-gray-300">Circulating Supply</TableCell>
                        <TableCell className="text-gray-300">{data.market_data.circulating_supply}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}   