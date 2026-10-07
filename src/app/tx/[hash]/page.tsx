import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Panel from "@/app/components/DashboardPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { AddressLink, BlockLink, DetailList, ExplorerPage, RpcError, trimNumber, when } from "@/app/components/explorer/ExplorerParts";
import { explorerChain, type TxDetails } from "@/lib/explorer";
import { cachedTx } from "@/lib/explorerCache";
import { chainInfo, explorerTx } from "@/lib/chains";
import TxLiveStatus from "@/app/components/explorer/TxLiveStatus";

type Props = { params: Promise<{ hash: string }>; searchParams: Promise<{ chain?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { hash } = await params;
    return { title: `Transaction ${hash.slice(0, 10)}…`, description: `Ethereum transaction ${hash}: status, value, fee and token transfers` };
}

const STATUS: Record<TxDetails['status'], string> = { success: 'Success', failed: 'Failed', pending: 'Pending' };

// Transaction detail page
export default async function TxPage({ params, searchParams }: Props) {
    const { hash } = await params;
    const chain = explorerChain((await searchParams).chain);
    const native = chainInfo(chain).native;

    let tx: TxDetails | null;
    try { tx = await cachedTx(chain, hash); }
    catch { return <ExplorerPage title="Transaction" subtitle={hash} chain={chain} path={`/tx/${hash}`}><RpcError chain={chain} /></ExplorerPage>; }
    if (!tx) notFound();

    const tokenEvents = tx.logs.filter(l => l.amount !== undefined || l.tokenId !== undefined);
    const otherEvents = tx.logs.length - tokenEvents.length;

    return (
        <ExplorerPage title="Transaction" subtitle={<span className="font-mono text-sm">{tx.hash}</span>} chain={chain} path={`/tx/${hash}`}>
            {tx.status === 'pending' && <TxLiveStatus hash={tx.hash} chain={chain} />}
            <Panel title="Overview">
                <DetailList rows={[
                    ['Status', <span key="s" className={tx.status === 'success' ? 'text-green-400' : tx.status === 'failed' ? 'text-red-400' : 'text-amber-400'}>{STATUS[tx.status]}</span>],
                    ['Block', tx.blockNumber === null ? 'Not mined yet' : <BlockLink number={tx.blockNumber} chain={chain} />],
                    ['Time (UTC)', tx.timestamp ? when(tx.timestamp) : '—'],
                    ['From', <AddressLink key="f" address={tx.from} chain={chain} />],
                    [tx.contractCreated ? 'Contract created' : 'To', tx.contractCreated ? <AddressLink key="c" address={tx.contractCreated} chain={chain} /> : tx.to ? <AddressLink key="t" address={tx.to} chain={chain} /> : '—'],
                    ['Value', `${trimNumber(tx.valueEth, 8)} ${native}`],
                    ['Transaction fee', tx.feeEth ? `${trimNumber(tx.feeEth, 8)} ${native}` : '—'],
                    ['Gas price', tx.gasPriceGwei ? `${trimNumber(tx.gasPriceGwei, 4)} gwei` : '—'],
                    ['Gas used / limit', `${tx.gasUsed ? Number(tx.gasUsed).toLocaleString('en-US') : '—'} / ${Number(tx.gasLimit).toLocaleString('en-US')}`],
                    ['Nonce', String(tx.nonce)],
                    ['Method', tx.methodId ? <span key="m" className="font-mono">{tx.methodId}</span> : 'Transfer'],
                ]} />
            </Panel>

            {tokenEvents.length > 0 && (
                <Panel title="Token Movements">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead className="text-gray-300">Event</TableHead><TableHead className="text-gray-300">From</TableHead><TableHead className="text-gray-300">To</TableHead>
                            <TableHead className="text-gray-300 text-right">Amount</TableHead><TableHead className="text-gray-300">Token</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {tokenEvents.map(l => (
                                <TableRow key={l.index} className="border-b border-gray-800">
                                    <TableCell className="text-gray-300">{l.event === 'Approval' ? 'Approval' : l.tokenId !== undefined ? 'NFT transfer' : 'Transfer'}</TableCell>
                                    <TableCell>{l.from && <AddressLink address={l.from} chain={chain} short />}</TableCell>
                                    <TableCell>{l.to && <AddressLink address={l.to} chain={chain} short />}</TableCell>
                                    <TableCell className="text-gray-100 text-right tabular-nums">{l.tokenId !== undefined ? `#${l.tokenId}${l.amount ? ' ×' + l.amount : ''}` : l.amount ? trimNumber(l.amount) : '—'}</TableCell>
                                    <TableCell><AddressLink address={l.address} chain={chain} short />{l.symbol && <span className="ml-2 text-gray-400">{l.symbol}</span>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            )}

            <p className="text-center text-sm text-gray-400">
                {tx.logs.length} event{tx.logs.length === 1 ? '' : 's'}{otherEvents > 0 && ` (${otherEvents} not decoded)`} ·{' '}
                <a href={explorerTx(chain, tx.hash)} target="_blank" rel="noopener noreferrer" className="underline">View on {new URL(chainInfo(chain).explorer).hostname}</a>
            </p>
        </ExplorerPage>
    );
}
