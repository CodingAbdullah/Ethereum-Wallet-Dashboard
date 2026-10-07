'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import useSWR, { useSWRConfig } from 'swr';
import { useAccount } from 'wagmi';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Button } from './ui/button';
import NetworkSelector from './NetworkSelector';
import ConnectWalletButton, { shortAddress } from './ConnectWalletButton';
import addressValidator from '../utils/functions/addressValidator';
import { usePrefillAddress } from '../hooks/useConnectedAddress';
import { useSession } from '../hooks/useSession';
import { chainInfo } from '@/lib/chains';
import PortfolioOverview from './PortfolioOverview';
import WalletInsightsSection from './WalletInsightsSection';

interface SavedWallet {
    id: number;
    address: string;
    chain: string;
    label: string | null;
}

const MAX_WALLETS = 5;
const buttonClass = "bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 font-medium";
const noopSubscribe = () => () => {};

async function fetchWallets(url: string): Promise<SavedWallet[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load your wallets');
    return response.json();
}

function Panel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
    return (
        <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
            <CardHeader className="border-b border-gray-800 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-100">{title}</CardTitle>
                <CardDescription className="text-gray-400 text-lg font-light">{description}</CardDescription>
            </CardHeader>
            {children && <CardContent className="space-y-6 pt-6">{children}</CardContent>}
        </Card>
    );
}

// My Dashboard: sign in with the connected wallet, then save and remove the wallets you follow
export default function MyDashboardSection() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { isConnected } = useAccount();
    const { session, isSignedIn, isLoading, signingIn, error: signInError, signIn } = useSession();

    if (!mounted || isLoading) {
        return <div className="container mx-auto px-4 w-full max-w-3xl"><Panel title="Loading…" description="Checking your session" /></div>;
    }

    let content: React.ReactNode;
    if (session && !session.accountsEnabled) {
        content = <Panel title="Accounts are not set up" description="This server needs AUTH_SECRET and DATABASE_URL to save wallets." />;
    }
    else if (!isConnected && !isSignedIn) {
        content = (
            <Panel title="Connect your wallet" description="Connect a wallet, then sign a message to prove it's yours. Signing is free and sends no transaction.">
                <div className="flex justify-center"><ConnectWalletButton /></div>
            </Panel>
        );
    }
    else if (!isSignedIn) {
        content = (
            <Panel title="Sign in" description="Sign a one-time message with your wallet. It's free and sends no transaction.">
                {signInError && <Alert variant="destructive"><AlertDescription>{signInError}</AlertDescription></Alert>}
                <div className="flex justify-center">
                    <Button className={buttonClass} disabled={signingIn} onClick={signIn}>
                        {signingIn ? 'Check your wallet…' : 'Sign in with Ethereum'}
                    </Button>
                </div>
            </Panel>
        );
    }
    else {
        content = <SavedWallets />;
    }

    return <div className="container mx-auto px-4 w-full max-w-5xl space-y-8">{content}</div>;
}

function SavedWallets() {
    const { data: wallets, error, mutate: mutateWallets } = useSWR('/api/wallets', fetchWallets);
    const { mutate: mutateKey } = useSWRConfig();
    // Saving or removing a wallet changes the portfolio too
    const mutate = () => Promise.all([mutateWallets(), mutateKey('/api/portfolio'), mutateKey('/api/portfolio/insights')]);
    const addressRef = useRef<HTMLInputElement>(null);
    const labelRef = useRef<HTMLInputElement>(null);
    const [network, setNetwork] = useState('eth');
    const [formError, setFormError] = useState<string>();
    const [saving, setSaving] = useState(false);
    usePrefillAddress(addressRef);

    const addWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        const address = addressRef.current!.value.trim();
        if (!addressValidator(address)) {
            setFormError('Enter a valid wallet address');
            return;
        }
        setSaving(true);
        setFormError(undefined);
        const response = await fetch('/api/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, chain: network, label: labelRef.current!.value.trim() || undefined })
        });
        setSaving(false);
        if (!response.ok) {
            setFormError((await response.json().catch(() => ({}))).error ?? 'Could not save the wallet');
            return;
        }
        addressRef.current!.value = '';
        labelRef.current!.value = '';
        mutate();
    };

    const removeWallet = async (id: number) => {
        await fetch('/api/wallets', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        mutate();
    };

    const full = (wallets?.length ?? 0) >= MAX_WALLETS;

    return (
        <>
            {wallets && wallets.length > 0 && <PortfolioOverview />}
            {wallets && wallets.length > 0 && <WalletInsightsSection source={{ kind: 'me' }} />}

            <Panel title="Saved Wallets" description={`Follow up to ${MAX_WALLETS} wallets.`}>
                {error && <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>}
                {!wallets && !error && <p className="text-gray-400">Loading…</p>}
                {wallets?.length === 0 && <p className="text-gray-400">No saved wallets yet. Add one below.</p>}
                {wallets && wallets.length > 0 && (
                    <ul className="divide-y divide-gray-800">
                        {wallets.map(wallet => (
                            <li key={wallet.id} className="flex items-center justify-between gap-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-gray-100 font-medium truncate">{wallet.label ?? shortAddress(wallet.address)}</p>
                                    <p className="text-gray-500 text-sm font-mono truncate">{wallet.address} · {chainInfo(wallet.chain).name}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/wallet-activity/${wallet.address}`} className="text-sm text-gray-300 hover:text-white underline">View</Link>
                                    <button onClick={() => removeWallet(wallet.id)} className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800" aria-label={`Remove ${wallet.label ?? wallet.address}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Panel title="Add a Wallet" description={full ? `You've saved ${MAX_WALLETS} wallets. Remove one to add another.` : 'Your connected wallet is filled in; replace it to follow any address.'}>
                {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
                <form onSubmit={addWallet} className="space-y-4">
                    <Input placeholder="Wallet Address" ref={addressRef} disabled={full} required className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500" />
                    <Input placeholder="Label (optional)" ref={labelRef} disabled={full} maxLength={40} className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500" />
                    <NetworkSelector networkSelector={setNetwork} />
                    <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={full || saving} className={buttonClass}>{saving ? 'Saving…' : 'Save Wallet'}</Button>
                    </div>
                </form>
            </Panel>
        </>
    );
}
