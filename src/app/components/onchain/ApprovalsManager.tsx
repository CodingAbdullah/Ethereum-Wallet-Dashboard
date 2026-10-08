'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAccount } from 'wagmi';
import { CHAINS, chainByChainId, type ChainKey } from '@/lib/chains';
import { revokePlan, type RevokeTarget } from '@/lib/onchain/actions';
import type { TokenApproval } from '@/lib/walletInsights';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';
import TxFlowPanel from './TxFlowPanel';

const MAINNETS = Object.values(CHAINS).filter(c => !c.testnet);
const MAX_BATCH = 8;
const noopSubscribe = () => () => {};
const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);
const keyOf = (a: TokenApproval) => a.tokenAddress + ':' + a.spender.toLowerCase();
const usd = (v: number | null) => v === null ? '—' : '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });

async function fetchApprovals([url, address, network]: [string, string, string]): Promise<{ approvals: TokenApproval[]; verified: boolean }> {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, network }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? 'Could not load approvals');
    return body;
}

const toTarget = (a: TokenApproval): RevokeTarget => ({ tokenAddress: a.tokenAddress, tokenSymbol: a.tokenSymbol, spender: a.spender, spenderLabel: a.spenderLabel });

export default function ApprovalsManager() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { address, chainId } = useAccount();
    const walletChain = chainId ? chainByChainId(chainId) : undefined;
    const [network, setNetwork] = useState<ChainKey | null>(null);
    const chain: ChainKey = network ?? (walletChain && !walletChain.testnet ? walletChain.key as ChainKey : 'eth');
    const { data, error, isLoading, mutate } = useSWR(address ? ['/api/approvals', address, chain] as [string, string, string] : null, fetchApprovals);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [plan, setPlan] = useState<TxPlan | null>(null);
    const panel = useRef<HTMLDivElement>(null);

    useEffect(() => { if (plan) panel.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [plan]);

    if (!mounted) return null;
    if (!address) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center space-y-4">
                <p className="text-gray-300">Connect your wallet to see and revoke the token approvals it has given.</p>
                <div className="flex justify-center"><ConnectWalletButton /></div>
            </div>
        );
    }

    const approvals = data?.approvals ?? [];
    const toggle = (key: string) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else if (next.size < MAX_BATCH) next.add(key);
        return next;
    });
    const chosen = approvals.filter(a => selected.has(keyOf(a)));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-5 min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="text-sm text-gray-400">Network
                    <select value={chain} onChange={e => { setNetwork(e.target.value as ChainKey); setSelected(new Set()); setPlan(null); }}
                        className="block mt-1 h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3">
                        {MAINNETS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
                    </select>
                </label>
                <button disabled={chosen.length === 0 || !!plan} onClick={() => setPlan(revokePlan(chain, chosen.map(toTarget)))}
                    className="rounded-md bg-gray-100 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-40">
                    Revoke selected{chosen.length ? ` (${chosen.length})` : ''}
                </button>
            </div>

            <div ref={panel}>
                {plan && <TxFlowPanel plan={plan} onClose={() => setPlan(null)} onDone={() => { setSelected(new Set()); mutate(); }} />}
            </div>

            {isLoading && <p className="text-gray-500">Loading approvals…</p>}
            {error && <p className="text-red-400">{String(error.message)}</p>}
            {data && approvals.length === 0 && <p className="text-gray-400">No token approvals on {CHAINS[chain].name}. Nothing can spend your tokens here.</p>}
            {approvals.length > 0 && (
                <>
                    <p className="text-sm text-gray-500">
                        {approvals.length} approval{approvals.length === 1 ? '' : 's'}, riskiest first. Select up to {MAX_BATCH} to revoke together.
                        {data && !data.verified ? ' Live allowances could not be checked, so recently revoked approvals may still show.' : ''}
                    </p>
                    <ul className="divide-y divide-gray-800 border-y border-gray-800">
                        {approvals.map(a => {
                            const key = keyOf(a);
                            return (
                                <li key={key} className="py-3 flex items-start gap-3">
                                    <input type="checkbox" aria-label={`Select ${a.tokenSymbol} approval for ${a.spenderLabel ?? a.spender}`} className="mt-1.5 h-4 w-4 accent-gray-200"
                                        checked={selected.has(key)} onChange={() => toggle(key)} disabled={!selected.has(key) && selected.size >= MAX_BATCH} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-100 font-medium break-words">
                                            {a.tokenSymbol} <span className="text-gray-500 font-normal">→</span>{' '}
                                            <Link href={`/address/${a.spender}?chain=${chain}`} className="underline">{a.spenderLabel ?? short(a.spender)}</Link>
                                            {!a.spenderLabel && <span className="ml-2 text-xs rounded px-1.5 py-0.5 bg-amber-900/50 text-amber-200">Unknown spender</span>}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {a.unlimited ? <span className="text-amber-300">Unlimited</span> : a.amount} · {usd(a.usdAtRisk)} at risk{a.approvedAt ? ` · approved ${new Date(a.approvedAt).toLocaleDateString()}` : ''}
                                        </p>
                                    </div>
                                    <button onClick={() => setPlan(revokePlan(chain, [toTarget(a)]))} disabled={!!plan}
                                        className="shrink-0 rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-800 disabled:opacity-40">
                                        Revoke
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}
