'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useAccount } from 'wagmi';
import { isAddress, isAddressEqual } from 'viem';
import { CHAINS, chainByChainId, type ChainKey } from '@/lib/chains';
import { commonTokens } from '@/lib/onchain/contracts';
import { sendPlan, type SendAsset } from '@/lib/onchain/actions';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';
import TxFlowPanel from './TxFlowPanel';
import { AmountInput, NetworkSelect, amountError, inputClass, maxNative, primaryButton, selectClass, useAsset } from './fields';

interface Recipient { address: string; ensName: string | null; isContract: boolean; label: string | null }
const noopSubscribe = () => () => {};
const looksLikeName = (v: string) => /^[^\s]+\.[a-z]{2,}$/i.test(v);

export default function SendForm() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { address, chainId } = useAccount();
    const walletChain = chainId ? chainByChainId(chainId)?.key as ChainKey | undefined : undefined;
    const [picked, setPicked] = useState<ChainKey | null>(null);
    const chain = picked ?? walletChain ?? 'eth';
    const [assetChoice, setAssetChoice] = useState('native');      // 'native', a token address, or 'other'
    const [otherToken, setOtherToken] = useState('');
    const [to, setTo] = useState('');
    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [recipientError, setRecipientError] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [plan, setPlan] = useState<TxPlan | null>(null);

    const tokenAddress = assetChoice === 'native' ? undefined : assetChoice === 'other' ? (isAddress(otherToken, { strict: false }) ? otherToken : undefined) : assetChoice;
    const { data: asset, error: assetError, mutate } = useAsset(chain, address, assetChoice === 'native' ? undefined : tokenAddress);

    // Resolve the recipient (ENS name or address) shortly after typing stops
    useEffect(() => {
        const input = to.trim();
        if (!input || (!isAddress(input, { strict: false }) && !looksLikeName(input))) return;
        const timer = setTimeout(async () => {
            const response = await fetch('/api/recipient', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chain, input }) });
            const body = await response.json().catch(() => ({}));
            if (response.ok) { setRecipient(body); setRecipientError(null); }
            else { setRecipient(null); setRecipientError(body.error ?? 'Could not check this address'); }
        }, 400);
        return () => clearTimeout(timer);
    }, [to, chain]);

    if (!mounted) return null;
    if (!address) {
        return <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center space-y-4"><p>Connect the wallet you want to send from.</p><div className="flex justify-center"><ConnectWalletButton /></div></div>;
    }

    const native = CHAINS[chain].native;
    const sendAsset: SendAsset | null = assetChoice === 'native' ? { kind: 'native', symbol: native } : asset && tokenAddress ? { kind: 'erc20', address: tokenAddress, symbol: asset.symbol, decimals: asset.decimals } : null;
    const amountProblem = amountError(amount, asset?.balance, asset?.decimals);
    const typed = to.trim();
    const recipientReady = recipient && (isAddress(typed, { strict: false }) ? isAddressEqual(recipient.address as `0x${string}`, typed as `0x${string}`) : recipient.ensName === typed.toLowerCase());
    const toSelf = recipientReady && isAddressEqual(recipient!.address as `0x${string}`, address);
    const canReview = !!sendAsset && !!recipientReady && !!amount && !amountProblem && !plan;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-4 min-w-0">
            <div className="grid gap-4 sm:grid-cols-2">
                <NetworkSelect value={chain} onChange={c => { setPicked(c); setAssetChoice('native'); setPlan(null); }} />
                <label className="block text-sm text-gray-400">Asset
                    <select value={assetChoice} onChange={e => { setAssetChoice(e.target.value); setPlan(null); }} className={selectClass}>
                        <option value="native">{native}</option>
                        {commonTokens(chain).map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
                        <option value="other">Other token (paste address)…</option>
                    </select>
                </label>
            </div>
            {assetChoice === 'other' && (
                <label className="block text-sm text-gray-400">Token contract address
                    <input value={otherToken} onChange={e => setOtherToken(e.target.value.trim())} placeholder="0x…" className={inputClass} />
                </label>
            )}
            {assetError && tokenAddress && <p className="text-sm text-red-400">{String(assetError.message)}</p>}

            <label className="block text-sm text-gray-400">Recipient
                <input value={to} onChange={e => { setTo(e.target.value); setPlan(null); }} placeholder="0x… or name.eth" className={inputClass} aria-label="Recipient" />
            </label>
            {typed && recipientError && <p className="text-sm text-red-400">{recipientError}</p>}
            {recipientReady && (
                <div className="text-sm space-y-1">
                    <p className="text-gray-400 break-all">{recipient!.ensName && !isAddress(typed, { strict: false }) ? `${recipient!.ensName} → ` : ''}<span className="font-mono">{recipient!.address}</span>{recipient!.label ? ` (${recipient!.label})` : recipient!.ensName && isAddress(typed, { strict: false }) ? ` (${recipient!.ensName})` : ''}</p>
                    {recipient!.isContract && <p className="text-amber-300">This is a contract, not a personal wallet. Only send to it if you know it can receive {sendAsset?.symbol ?? 'this asset'}, or the funds may be stuck.</p>}
                    {toSelf && <p className="text-amber-300">This is your own address.</p>}
                </div>
            )}

            <AmountInput value={amount} onChange={v => { setAmount(v); setPlan(null); }} balance={asset?.balance} symbol={asset?.symbol}
                onMax={() => setAmount(assetChoice === 'native' ? maxNative(asset?.balance) : asset?.balance ?? '')} />
            {amountProblem && <p className="text-sm text-red-400">{amountProblem}</p>}

            <div className="flex justify-end">
                <button className={primaryButton} disabled={!canReview} onClick={() => sendAsset && setPlan(sendPlan(chain, sendAsset, recipient!.address, amount, recipient!.ensName ?? recipient!.label ?? undefined))}>Review</button>
            </div>
            {plan && <TxFlowPanel plan={plan} onClose={() => setPlan(null)} onDone={() => { setAmount(''); mutate(); }} />}
        </div>
    );
}
