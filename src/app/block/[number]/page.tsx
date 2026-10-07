import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Panel from "@/app/components/DashboardPanel";
import { AddressLink, BlockLink, DetailList, ExplorerPage, RpcError, TxLink, trimNumber, when } from "@/app/components/explorer/ExplorerParts";
import { explorerChain, type BlockDetails } from "@/lib/explorer";
import { cachedBlock } from "@/lib/explorerCache";
import { chainInfo } from "@/lib/chains";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ chain?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { number } = await params;
    return { title: number === 'latest' ? 'Latest Block' : `Block ${number}`, description: `Block ${number}: transactions, gas used, base fee and burnt ETH` };
}

// Block detail page (/block/latest shows the newest block)
export default async function BlockPage({ params, searchParams }: Props) {
    const { number } = await params;
    const chain = explorerChain((await searchParams).chain);
    const native = chainInfo(chain).native;

    let block: BlockDetails | null;
    try { block = await cachedBlock(chain, number); }
    catch { return <ExplorerPage title="Block" subtitle={number} chain={chain} path={`/block/${number}`}><RpcError chain={chain} /></ExplorerPage>; }
    if (!block) notFound();

    return (
        <ExplorerPage title={`Block ${block.number.toLocaleString('en-US')}`} subtitle={when(block.timestamp) + ' UTC'} chain={chain} path={`/block/${number}`}>
            <Panel title="Overview">
                <DetailList rows={[
                    ['Block', <span key="n" className="tabular-nums">{block.number.toLocaleString('en-US')}{block.number > 0 && <> · <BlockLink number={block.number - 1} chain={chain} /> ← previous</>}{number !== 'latest' && <> · next → <BlockLink number={block.number + 1} chain={chain} /></>}</span>],
                    ['Hash', <span key="h" className="font-mono text-sm break-all">{block.hash}</span>],
                    ['Transactions', block.txCount.toLocaleString('en-US')],
                    ['Fee recipient', <AddressLink key="m" address={block.miner} chain={chain} />],
                    ['Gas used', `${Number(block.gasUsed).toLocaleString('en-US')} (${block.gasUsedPercent.toFixed(2)}% of ${Number(block.gasLimit).toLocaleString('en-US')})`],
                    ['Base fee', block.baseFeeGwei ? `${trimNumber(block.baseFeeGwei, 4)} gwei` : '—'],
                    ['Burnt fees', block.burntEth ? `${trimNumber(block.burntEth, 6)} ${native}` : '—'],
                    ...(block.blobGasUsed && block.blobGasUsed !== '0' ? [['Blob gas used', Number(block.blobGasUsed).toLocaleString('en-US')] as [string, string]] : []),
                ]} />
            </Panel>

            {block.transactions.length > 0 && (
                <Panel title="Transactions" description={block.txCount > block.transactions.length ? `First ${block.transactions.length} of ${block.txCount}` : undefined}>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {block.transactions.map(hash => <li key={hash} className="text-sm"><TxLink hash={hash} chain={chain} short /></li>)}
                    </ul>
                </Panel>
            )}
        </ExplorerPage>
    );
}
