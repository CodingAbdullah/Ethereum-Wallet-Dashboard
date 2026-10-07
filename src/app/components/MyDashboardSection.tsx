'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import useSWR, { useSWRConfig } from 'swr';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Button } from './ui/button';
import NetworkSelector from './NetworkSelector';
import { shortAddress } from './ConnectWalletButton';
import SignInGate, { buttonClass, Panel } from './SignInGate';
import addressValidator from '../utils/functions/addressValidator';
import { usePrefillAddress } from '../hooks/useConnectedAddress';
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

async function fetchWallets(url: string): Promise<SavedWallet[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load your wallets');
    return response.json();
}

// My Dashboard: sign in with the connected wallet, then save and remove the wallets you follow
export default function MyDashboardSection() {
    return (
        <div className="container mx-auto px-4 w-full max-w-5xl space-y-8">
            <SignInGate notConfigured="This server needs AUTH_SECRET and DATABASE_URL to save wallets.">
                <SavedWallets />
            </SignInGate>
        </div>
    );
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
