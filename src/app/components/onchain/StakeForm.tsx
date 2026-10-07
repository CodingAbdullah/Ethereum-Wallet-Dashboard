'use client';

import { useState, useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { CHAINS, chainByChainId, type ChainKey } from '@/lib/chains';
import { WRAPPED_NATIVE } from '@/lib/onchain/contracts';
import { lidoStakePlan, rocketPoolStakePlan, unwrapPlan, wrapPlan } from '@/lib/onchain/actions';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';
import TxFlowPanel from './TxFlowPanel';
import { AmountInput, NetworkSelect, amountError, maxNative, primaryButton, useAsset } from './fields';

type Mode = 'wrap' | 'unwrap' | 'lido' | 'rocketpool';
const MODES: { id: Mode; label: string }[] = [
    { id: 'lido', label: 'Stake (Lido)' },
    { id: 'rocketpool', label: 'Stake (Rocket Pool)' },
    { id: 'wrap', label: 'Wrap' },
    { id: 'unwrap', label: 'Unwrap' }
];
const noopSubscribe = () => () => {};
const canWrap = (c: ChainKey) => !!WRAPPED_NATIVE[c];

export default function StakeForm() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { address, chainId } = useAccount();
    const [mode, setMode] = useState<Mode>('lido');
    const walletChain = chainId ? chainByChainId(chainId)?.key as ChainKey | undefined : undefined;
    const [picked, setPicked] = useState<ChainKey | null>(null);
    const staking = mode === 'lido' || mode === 'rocketpool';
    const chain: ChainKey = staking ? 'eth' : picked ?? (walletChain && canWrap(walletChain) ? walletChain : 'eth');
    const [amount, setAmount] = useState('');
    const [plan, setPlan] = useState<TxPlan | null>(null);
    const wrapped = WRAPPED_NATIVE[chain];
    const { data: asset, mutate } = useAsset(chain, address, mode === 'unwrap' ? wrapped?.address : undefined);
    const { data: stakeInfo, error: stakeInfoError } = useSWR<{ rocketDepositPool: string }>(mode === 'rocketpool' ? '/api/stake-info' : null, (u: string) => fetch(u).then(r => r.ok ? r.json() : Promise.reject(new Error('Rocket Pool is unavailable right now'))));

    if (!mounted) return null;
    if (!address) {
        return <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center space-y-4"><p>Connect the wallet you want to use.</p><div className="flex justify-center"><ConnectWalletButton /></div></div>;
    }

    const native = CHAINS[chain].native;
    const problem = amountError(amount, asset?.balance);
    const review = () => {
        if (mode === 'wrap') setPlan(wrapPlan(chain, amount, native));
        else if (mode === 'unwrap') setPlan(unwrapPlan(chain, amount, native));
        else if (mode === 'lido') setPlan(lidoStakePlan(amount));
        else if (stakeInfo) setPlan(rocketPoolStakePlan(stakeInfo.rocketDepositPool, amount));
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-4 min-w-0">
            <div role="tablist" className="flex flex-wrap gap-2">
                {MODES.map(m => (
                    <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => { setMode(m.id); setPlan(null); setAmount(''); }}
                        className={`rounded-full px-3 py-1 text-sm ring-1 ${mode === m.id ? 'bg-gray-200 text-gray-900 ring-gray-200' : 'text-gray-300 ring-gray-600 hover:bg-gray-700'}`}>{m.label}</button>
                ))}
            </div>

            {mode === 'lido' && <p className="text-sm text-gray-400">Stake ETH on Ethereum and receive stETH 1:1. stETH earns staking rewards every day and can be used across DeFi. See current rates on the <a href="/staking" className="underline">staking page</a>.</p>}
            {mode === 'rocketpool' && <p className="text-sm text-gray-400">Stake ETH on Ethereum and receive rETH, which rises in value against ETH as rewards accrue. Rocket Pool is run by a decentralized set of node operators.</p>}
            {(mode === 'wrap' || mode === 'unwrap') && (
                <>
                    <p className="text-sm text-gray-400">{mode === 'wrap' ? `Turn ${native} into ${wrapped?.symbol ?? 'its wrapped token'} (an ERC20 token worth exactly the same), for apps that need it.` : `Turn ${wrapped?.symbol ?? 'the wrapped token'} back into ${native}.`}</p>
                    <NetworkSelect value={chain} onChange={c => { setPicked(c); setPlan(null); }} only={canWrap} />
                </>
            )}
            {mode === 'rocketpool' && stakeInfoError && <p className="text-sm text-red-400">{String(stakeInfoError.message)}</p>}

            <AmountInput value={amount} onChange={v => { setAmount(v); setPlan(null); }} balance={asset?.balance} symbol={asset?.symbol}
                onMax={() => setAmount(mode === 'unwrap' ? asset?.balance ?? '' : maxNative(asset?.balance))} />
            {problem && <p className="text-sm text-red-400">{problem}</p>}

            <div className="flex justify-end">
                <button className={primaryButton} disabled={!amount || !!problem || !!plan || (mode === 'rocketpool' && !stakeInfo)} onClick={review}>Review</button>
            </div>
            {plan && <TxFlowPanel plan={plan} onClose={() => setPlan(null)} onDone={() => { setAmount(''); mutate(); }} />}
        </div>
    );
}
