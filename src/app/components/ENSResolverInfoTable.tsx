"use client";

import useSWR from "swr";
import PostFetcher from "@/app/utils/functions/PostFetcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import ENSResolverType from "../utils/types/ENSResolverType";
import PostFetcherArgumentsType from '../utils/types/PostFetcherArgumentsType';

// ENS Resolver Info Table Component
export default function ENSResolverInfoTable(props: { data: string }) {
    const { data } = props;
    const { data: ensResolverData, error, isLoading } = 
    useSWR<{ results: ENSResolverType[] }>(['/api/ens-resolver-information', { address: data }], ([url, body]: [string, PostFetcherArgumentsType]) => PostFetcher(url, { arg: body }), { refreshInterval: 100000 });

    // Conditionally render ENS Resolver data
    if (isLoading) {
        return <div>Loading ENS Resolver Data...</div>
    }
    else if (error) {
        throw new Error();
    }
    else {
        // Render the ENS Resolver Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">ENS Resolver</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">ENS Name</TableHead>
                            <TableHead className="text-gray-300">Creation Date</TableHead>
                            <TableHead className="text-gray-300">Expiration Date</TableHead>
                            <TableHead className="text-gray-300">Grace Period</TableHead>
                            <TableHead className="text-gray-300">Premium Period</TableHead>
                            <TableHead className="text-gray-300">In Grace</TableHead>
                            <TableHead className="text-gray-300">In Period</TableHead>
                            <TableHead className="text-gray-300">Expired</TableHead>
                            <TableHead className="text-gray-300">Last Refreshed</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ensResolverData?.results?.map(ens => (
                            <TableRow key={ens.ens_name} className="border-b border-gray-800">
                                <TableCell className="font-medium text-gray-100">{ens.ens_name}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.registration_timestamp.split("T")[0]}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.expiration_timestamp.split("T")[0]}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.grace_period_ends.split("T")[0]}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.premium_period_ends.split("T")[0]}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.in_grace_period ? "YES" : "NO"}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.in_premium_period ? "YES" : "NO"}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.is_expired ? "YES" : "NO"}</TableCell>
                                <TableCell className="font-medium text-gray-100">{ens.last_refreshed.split("T")[0]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}