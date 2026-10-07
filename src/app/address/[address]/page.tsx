import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Panel from "@/app/components/DashboardPanel";
import WalletInsightsSection from "@/app/components/WalletInsightsSection";
import { DetailList, ExplorerPage, RpcError, trimNumber } from "@/app/components/explorer/ExplorerParts";
import { explorerChain, type AddressDetails } from "@/lib/explorer";
import { cachedAddress } from "@/lib/explorerCache";
import { chainInfo, explorerAddress } from "@/lib/chains";
import { labelFor } from "@/lib/labels";

type Props = { params: Promise<{ address: string }>; searchParams: Promise<{ chain?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { address } = await params;
    return { title: `Address ${address.slice(0, 8)}…`, description: `Balance, activity, token approvals and DeFi positions for ${address}` };
}

// Address page: balance and type, then activity, approvals and DeFi positions (wallets)
export default async function AddressPage({ params, searchParams }: Props) {
    const { address } = await params;
    const chain = explorerChain((await searchParams).chain);

    let details: AddressDetails | null;
    try { details = await cachedAddress(chain, address); }
    catch { return <ExplorerPage title="Address" subtitle={address} chain={chain} path={`/address/${address}`}><RpcError chain={chain} /></ExplorerPage>; }
    if (!details) notFound();

    const query = chain === 'eth' ? '' : '?chain=' + chain;
    const label = chain === 'eth' ? labelFor(details.address) : null;
    return (
        <ExplorerPage title={details.token ? `${details.token.name ?? details.token.symbol} (${details.token.symbol})` : details.isContract ? 'Contract' : 'Address'} subtitle={<span className="font-mono text-sm">{details.address}</span>} chain={chain} path={`/address/${details.address}`}>
            <Panel title="Overview">
                <DetailList rows={[
                    ...(label ? [['Name', label.name] as [string, string]] : []),
                    ['Balance', `${trimNumber(details.balance, 8)} ${details.native}`],
                    ['Type', details.isContract ? `Contract (${details.codeSize.toLocaleString('en-US')} bytes)` : 'Wallet'],
                    ['Transactions sent', details.txCount.toLocaleString('en-US')],
                    ...(details.token ? [['Token', <Link key="t" href={`/token/${details.address}${query}`} className="underline">{details.token.symbol} token page</Link>] as [string, React.ReactNode]] : []),
                    ['Explorer', <a key="e" href={explorerAddress(chain, details.address)} target="_blank" rel="noopener noreferrer" className="underline">{new URL(chainInfo(chain).explorer).hostname}</a>],
                ]} />
            </Panel>
            {!details.isContract && <WalletInsightsSection source={{ kind: 'wallet', address: details.address, network: chain }} />}
            {!details.isContract && chain === 'eth' && (
                <p className="text-center text-sm text-gray-400"><Link href={`/wallet-activity/${details.address}`} className="underline">Full transaction history</Link></p>
            )}
        </ExplorerPage>
    );
}
