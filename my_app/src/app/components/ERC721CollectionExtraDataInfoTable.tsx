'use client';

import useSWR from "swr";
import Image from "next/image";
import PostFetcher from "../utils/functions/PostFetcher";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import ERC721CollectionExtraDataType from "../utils/types/ERC721CollectionExtraDataType";
import ERC721CollectionFloorPriceChart from "./ERC721CollectionFloorPriceChart";
import ERC721CollectionMarketCapChart from "./ERC721CollectionMarketCapChart";
import ERC721CollectionVolumeChart from "./ERC721CollectionVolumeChart";

// ERC721 Collection Extra Data Info Table Custom Component
export default function ERC721CollectionExtraDataInfoTable(props : { address: string }){
    const { address } = props;
    const {data, error, isLoading } = useSWR(['/api/erc721-collection-extra-data', { address }], ([url, body]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render component
    if (isLoading) {
        return <div>Loading ERC721 Collection Extra Data Info Table...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        const erc721CollectionExtraData: ERC721CollectionExtraDataType = data.information;

        // Render ERC721 Collection Extra Data Info Table Component
        return (
            <>
                <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">Extra Information</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-300">Market</TableHead>
                                <TableHead className="text-gray-300">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Contract Address</TableCell>
                                <TableCell className="text-gray-300">{erc721CollectionExtraData.contract_address}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Image</TableCell>
                                <TableCell className="text-gray-300">
                                    <Image src={erc721CollectionExtraData.image.small} alt="ERC721 Collection Image.png" width={50} height={50} />
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Market Cap</TableCell>
                                <TableCell className="text-gray-300">{"$" + erc721CollectionExtraData.market_cap.usd}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Market Cap 24 Hour % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.market_cap_24h_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.market_cap_24h_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.market_cap_24h_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Volume</TableCell>
                                <TableCell className="text-gray-300">{"$" + erc721CollectionExtraData.volume_24h.usd}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Volume 24 Hour % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.volume_24h_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.volume_24h_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.volume_24h_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price</TableCell>
                                <TableCell className="text-gray-300">{"$" + erc721CollectionExtraData.floor_price.usd}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price 24 % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.floor_price_24h_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.floor_price_24h_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.floor_price_24h_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price 7 Day % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.floor_price_7d_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.floor_price_7d_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.floor_price_7d_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price 14 Day % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.floor_price_14d_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.floor_price_14d_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.floor_price_14d_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price 30 Day % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.floor_price_30d_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.floor_price_30d_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.floor_price_30d_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Floor Price 60 Day % Change</TableCell>
                                <TableCell className={erc721CollectionExtraData.floor_price_60d_percentage_change.usd < 0 ? 'text-red-500' : 'text-green-500'}>
                                    {erc721CollectionExtraData.floor_price_60d_percentage_change.usd >= 0 ? '+' : ''}{erc721CollectionExtraData.floor_price_60d_percentage_change.usd.toFixed(2) + '%'}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">Total Supply</TableCell>
                                <TableCell className='text-gray-300'>
                                    {erc721CollectionExtraData.total_supply}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">One Day Sales</TableCell>
                                <TableCell className='text-gray-300'>
                                    {erc721CollectionExtraData.one_day_sales}
                                </TableCell>
                            </TableRow>
                            <TableRow className="border-b border-gray-800">
                                <TableCell className="text-gray-300">One Day Average Sale Price</TableCell>
                                <TableCell className="text-gray-300">
                                    {erc721CollectionExtraData.one_day_average_sale_price + ' ETH'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <ERC721CollectionFloorPriceChart data={erc721CollectionExtraData} address={address} />
                <ERC721CollectionMarketCapChart data={erc721CollectionExtraData} address={address} />
                <ERC721CollectionVolumeChart data={erc721CollectionExtraData} address={address} />
            </>
        )
    }
}