"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import OpenseaAccountInfoType from "../utils/types/OpenseaAccountInfoType";
import useSWR from "swr";
import PostFetcher from "../utils/functions/PostFetcher";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// Opensea Account Information Custom Component
export default function OpenseaAccountInfoTable(props: { address: string }) {
    const { address } = props;

    // useSWR hook for enabling API request call
    const { data: openseaData, error: openseaAccountError, isLoading: loadingOpenseaAccountInformation } = 
    useSWR<OpenseaAccountInfoType>(['/api/opensea-account-information', { address }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render component
    if (loadingOpenseaAccountInformation) {
        return <div>Loading Opensea Account Table...</div>
    }
    else if (openseaAccountError) {
        throw new Error();
    }
    else {
        // After a successful request, render table with data        
        // Render Opensea Account Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Opensea Account Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Account Details</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={openseaData?.username} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Username</TableCell>
                            <TableCell className="text-gray-300">{openseaData?.username}</TableCell>
                        </TableRow>
                        <TableRow key={openseaData?.website} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Website</TableCell>
                            <TableCell className="text-gray-300">{openseaData?.website ? openseaData?.website : 'N/A'}</TableCell>
                        </TableRow>
                        {
                            openseaData?.social_media_accounts?.map(account => {
                                return (
                                    <TableRow key={account.platform} className="border-b border-gray-800">
                                        <TableCell className="font-medium text-gray-100">{account.platform}</TableCell>
                                        <TableCell className="text-gray-300">{account.username}</TableCell>
                                    </TableRow>
                                )
                            })
                        }
                        <TableRow key={openseaData?.bio} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Bio</TableCell>
                            <TableCell className="text-gray-300">{openseaData?.bio?openseaData?.bio : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow key={openseaData?.joined_date} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Join Date</TableCell>
                            <TableCell className="text-gray-300">{openseaData?.joined_date}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}