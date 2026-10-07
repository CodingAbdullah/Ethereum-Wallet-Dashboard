'use client';

import ERC20HoldingsType from "../utils/types/ERC20HoldingsType";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";
import { RiskBadge, riskKey, useTokenRisks } from "./TokenRiskBadge";
import { chainInfo } from "@/lib/chains";

// Custom ERC20 Holdings Info Table Component
export default function ERC20HoldingsInfoTable(props: { data: ERC20HoldingsType[], network?: string }) {
    const { data, network = 'eth' } = props;
    const { data: risks } = useTokenRisks((data ?? []).slice(0, 30).map(t => ({ chain: network, address: t.token_address })));

    // Render ERC20 Holdings Info Table Component
    return (
        <div className="p-4 bg-gray-900 mt-10 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-100">Holdings</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Token Address</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                        <TableHead className="text-gray-300">Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((transfer, index: number) => (
                        <TableRow key={index} className="border-b border-gray-800">
                            <TableCell className="text-gray-300">{String(transfer.name)} <RiskBadge risk={risks?.[riskKey(network, transfer.token_address)]} compact /></TableCell>
                            <TableCell className="text-gray-300">{transfer.token_address}</TableCell>
                            <TableCell className="text-gray-300">{transfer.symbol}</TableCell>
                            <TableCell className="text-gray-300">{transfer.balance}</TableCell>
                            <TableCell className="text-gray-300">
                                <Link href={ `/token/${transfer.token_address}${network === 'eth' ? '' : '?chain=' + network}` }>
                                    <u>Token page</u>
                                </Link>{' · '}
                                <Link target="_blank" href={ chainInfo(network).explorer + '/token/' + transfer.token_address }>
                                    <u>Explorer</u>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}   