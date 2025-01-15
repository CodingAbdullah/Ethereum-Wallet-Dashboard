'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import AccountInformationType from "../utils/types/AccountInformationType";
import Link from "next/link";

// Custom Component for viewing account details
export default function AccountToENSInfoTable(props: { data: AccountInformationType }) {
    const { data } = props;
    
    // Render table containing this key information
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Account Information</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">ENS Resolver</TableHead>
                        <TableHead className="text-gray-300">Personal Website</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow key={data.name} className="border-b border-gray-800">
                        <TableCell className="font-medium text-gray-100">{data.name}</TableCell>
                        <TableCell className="text-gray-300">
                            <Link target="_blank" href={'https://' + data.name + '.xyz/'}>
                                <u>{'https://' + data.name + '.xyz/'}</u>
                            </Link>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}