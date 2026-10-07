import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Panel from "@/app/components/DashboardPanel";
import ERC20TokenInformationSection from "@/app/components/ERC20TokenInformationSection";
import ERC20CollectionTransfersInfoTable from "@/app/components/ERC20CollectionTransfersInfoTable";
import ERC20CollectionOwnersInfoTable from "@/app/components/ERC20CollectionOwnersInfoTable";
import { AddressLink, DetailList, ExplorerPage, RpcError, trimNumber } from "@/app/components/explorer/ExplorerParts";
import { explorerChain, type TokenDetails } from "@/lib/explorer";
import { cachedToken } from "@/lib/explorerCache";

type Props = { params: Promise<{ address: string }>; searchParams: Promise<{ chain?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { address } = await params;
    return { title: `Token ${address.slice(0, 8)}…`, description: `ERC20 token ${address}: supply, price, holders and transfers` };
}

// ERC20 token page: on-chain metadata and supply, plus price, holders and transfers on Ethereum
export default async function TokenPage({ params, searchParams }: Props) {
    const { address } = await params;
    const chain = explorerChain((await searchParams).chain);

    let token: TokenDetails | null;
    try { token = await cachedToken(chain, address); }
    catch { return <ExplorerPage title="Token" subtitle={address} chain={chain} path={`/token/${address}`}><RpcError chain={chain} /></ExplorerPage>; }
    if (!token) notFound();

    return (
        <ExplorerPage title={`${token.name ?? token.symbol} (${token.symbol})`} subtitle={<span className="font-mono text-sm">{token.address}</span>} chain={chain} path={`/token/${token.address}`}>
            <Panel title="Overview">
                <DetailList rows={[
                    ['Contract', <AddressLink key="a" address={token.address} chain={chain} />],
                    ['Symbol', token.symbol ?? '—'],
                    ['Decimals', String(token.decimals)],
                    ['Total supply', token.totalSupply ? `${trimNumber(token.totalSupply, 2)} ${token.symbol}` : '—'],
                ]} />
            </Panel>
            {chain === 'eth' ? (
                <>
                    <ERC20TokenInformationSection address={token.address} />
                    <ERC20CollectionTransfersInfoTable address={token.address} />
                    <ERC20CollectionOwnersInfoTable address={token.address} />
                </>
            ) : (
                <p className="text-center text-sm text-gray-400">Price, holders and transfers are available for Ethereum mainnet tokens.</p>
            )}
        </ExplorerPage>
    );
}
