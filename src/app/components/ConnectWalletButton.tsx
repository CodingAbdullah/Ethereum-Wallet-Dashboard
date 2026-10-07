'use client';

import { useState, useSyncExternalStore } from 'react';
import { useAccount, useConnect, useConnectors, useDisconnect, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu';

const buttonClass = "inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 ring-1 ring-gray-700 hover:bg-gray-700 hover:text-white disabled:opacity-60";

const noopSubscribe = () => () => {};

export function shortAddress(address: string) {
    return address.slice(0, 6) + '…' + address.slice(-4);
}

// Connect Wallet button for the navbar: lists the available wallets, then shows the connected account
export default function ConnectWalletButton() {
    const [copied, setCopied] = useState(false);
    const { address, isConnected, connector: activeConnector } = useAccount();
    const connectors = useConnectors();
    const { connect, isPending, error, reset } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address, chainId: mainnet.id, query: { enabled: !!address } });

    // The wallet state lives in the browser, so render a placeholder on the server and during hydration
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

    if (!mounted) {
        return <button className={buttonClass} disabled><Wallet className="h-4 w-4" />Connect Wallet</button>;
    }

    if (isConnected && address) {
        const copyAddress = async () => {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger className={buttonClass}>
                    <Wallet className="h-4 w-4" />
                    {ensName ?? shortAddress(address)}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-mono text-xs break-all">{address}</DropdownMenuLabel>
                    {activeConnector && <DropdownMenuLabel className="pt-0 text-xs font-normal text-muted-foreground">Connected with {activeConnector.name}</DropdownMenuLabel>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={e => { e.preventDefault(); copyAddress(); }}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy address'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => disconnect()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // EIP-6963 can announce the same wallet as a connector we also configure (e.g. Coinbase), so list each name once.
    // The generic "Injected" connector is only shown when no extension announced itself.
    const seen = new Set<string>();
    const hasAnnouncedWallet = connectors.some(c => c.type === 'injected' && c.id !== 'injected');
    const options = connectors.filter(c => {
        if (c.id === 'injected' && hasAnnouncedWallet) return false;
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
    });

    return (
        <DropdownMenu onOpenChange={open => { if (open) reset(); }}>
            <DropdownMenuTrigger className={buttonClass} disabled={isPending}>
                <Wallet className="h-4 w-4" />
                {isPending ? 'Connecting…' : 'Connect Wallet'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Choose a wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map(connector => (
                    <DropdownMenuItem key={connector.uid} onSelect={() => connect({ connector })}>
                        {connector.icon
                            // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs announced by the extension
                            ? <img src={connector.icon} alt="" className="mr-2 h-4 w-4" />
                            : <Wallet className="mr-2 h-4 w-4" />}
                        {connector.id === 'injected' ? 'Browser Wallet' : connector.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
            {error && <span className="sr-only" role="alert">{error.message}</span>}
        </DropdownMenu>
    );
}
