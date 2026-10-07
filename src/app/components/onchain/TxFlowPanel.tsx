'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import { chainInfo } from '@/lib/chains';
import { useTxFlow, type SentTx, type TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';

const fmt = (n: number) => Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: Math.abs(n) >= 1 ? 4 : 8 });
const btn = "rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40";
const FLAG_STYLE = {
    danger: { icon: ShieldAlert, cls: 'border-red-800 bg-red-950/50 text-red-200' },
    warning: { icon: AlertTriangle, cls: 'border-amber-800 bg-amber-950/40 text-amber-200' },
    info: { icon: Info, cls: 'border-gray-700 bg-gray-800 text-gray-300' }
} as const;

function TxLinks({ sent, chain }: { sent: SentTx[]; chain: string }) {
    return (
        <ul className="space-y-1 text-sm">
            {sent.map((tx, i) => (
                <li key={tx.hash} className="flex items-center gap-2 min-w-0">
                    {tx.status === 'pending' ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : tx.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    <span className="shrink-0">{sent.length > 1 ? `Transaction ${i + 1}: ` : ''}{tx.status === 'pending' ? 'waiting to be mined' : tx.status === 'success' ? 'confirmed' : 'failed'}</span>
                    <Link href={`/tx/${tx.hash}?chain=${chain}`} className="underline truncate font-mono text-xs">{tx.hash}</Link>
                </li>
            ))}
        </ul>
    );
}

// Simulates the plan as soon as it is shown, previews what will happen, and walks the user through signing
export default function TxFlowPanel({ plan, onDone, onClose }: { plan: TxPlan; onDone?: (sent: SentTx[]) => void; onClose: () => void }) {
    const { state, simulate, confirm, address } = useTxFlow(onDone);
    const network = chainInfo(plan.chain).name;
    const planKey = JSON.stringify(plan);

    useEffect(() => {
        if (address) simulate(plan);
        // Re-simulate when the plan or wallet changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planKey, address, simulate]);

    const preview = 'preview' in state ? state.preview : null;
    const sim = preview?.simulation;

    return (
        <section aria-label="Transaction preview" className="rounded-xl border border-gray-700 bg-gray-950/60 p-4 space-y-4 text-sm text-gray-300 min-w-0">
            <div>
                <h3 className="text-lg font-semibold text-gray-100 break-words">{plan.title}</h3>
                <p className="text-gray-500">{network}{plan.calls.length > 1 ? ` · ${plan.calls.length} transactions, signed one after another` : ''}</p>
                {plan.description && <p className="mt-1 text-gray-400">{plan.description}</p>}
            </div>

            {!address && (
                <div className="space-y-2">
                    <p>Connect the wallet that will sign this transaction.</p>
                    <ConnectWalletButton />
                </div>
            )}

            {state.step === 'simulating' && <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Simulating on {network}…</p>}

            {sim && (
                <div className="space-y-2">
                    {sim.ok
                        ? <p className="flex items-center gap-2 text-green-300"><CheckCircle2 className="h-4 w-4" /> {sim.supported ? 'Simulation succeeded' : 'This should succeed'}</p>
                        : <p className="flex items-start gap-2 text-red-300"><XCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span className="break-words">This transaction would fail: {sim.error ?? 'unknown error'}</span></p>}
                    {sim.ok && sim.supported && (
                        sim.assetChanges.length === 0
                            ? <p className="text-gray-400">No balance changes for your wallet.</p>
                            : (
                                <div>
                                    <p className="text-gray-400 mb-1">Your balance changes:</p>
                                    <ul className="space-y-1">
                                        {sim.assetChanges.map(c => (
                                            <li key={String(c.token)} className={`font-mono ${c.amount < 0 ? 'text-red-300' : 'text-green-300'}`}>
                                                {c.amount < 0 ? '−' : '+'}{fmt(c.amount)} {c.symbol}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                    )}
                    {sim.ok && !sim.supported && <p className="text-gray-500">This network&apos;s RPC can&apos;t simulate in detail, so balance changes aren&apos;t shown. Check the details in your wallet.</p>}
                    {preview?.fee && <p className="text-gray-400">Network fee: about {fmt(preview.fee.estimate)} {preview.fee.symbol} ({preview.fee.gasPriceGwei} gwei)</p>}
                </div>
            )}

            {preview && preview.flags.length > 0 && (
                <ul className="space-y-2" aria-label="Warnings">
                    {preview.flags.map((f, i) => {
                        const { icon: Icon, cls } = FLAG_STYLE[f.level];
                        return <li key={i} className={`flex gap-2 rounded-md border px-3 py-2 ${cls}`}><Icon className="h-4 w-4 mt-0.5 shrink-0" /><span className="break-words">{f.text}</span></li>;
                    })}
                </ul>
            )}

            {state.step === 'signing' && (
                <div className="space-y-2">
                    <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />
                        {state.sent.length > state.index ? 'Waiting for the transaction to be mined…' : `Confirm ${plan.calls.length > 1 ? `transaction ${state.index + 1} of ${plan.calls.length}` : 'the transaction'} in your wallet…`}
                    </p>
                    <TxLinks sent={state.sent} chain={plan.chain} />
                </div>
            )}
            {state.step === 'done' && (
                <div className="space-y-2" role="status">
                    <p className="flex items-center gap-2 text-green-300 font-medium"><CheckCircle2 className="h-5 w-5" /> Done. {plan.calls.length > 1 ? 'All transactions were' : 'The transaction was'} confirmed.</p>
                    <TxLinks sent={state.sent} chain={plan.chain} />
                </div>
            )}
            {state.step === 'failed' && (
                <div className="space-y-2" role="alert">
                    <p className="flex items-start gap-2 text-red-300"><XCircle className="h-4 w-4 mt-0.5 shrink-0" /> <span className="break-words">{state.error}</span></p>
                    {state.sent.length > 0 && <TxLinks sent={state.sent} chain={plan.chain} />}
                </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
                {(state.step === 'preview' || (state.step === 'failed' && state.sent.length === 0 && preview)) && (
                    <button className={`${btn} bg-gray-100 text-gray-900 hover:bg-white`} disabled={!sim?.ok} onClick={() => preview && confirm(plan, preview)}>
                        Confirm in wallet
                    </button>
                )}
                {state.step === 'failed' && !preview && <button className={`${btn} bg-gray-700 text-gray-100 hover:bg-gray-600`} onClick={() => simulate(plan)}>Try again</button>}
                <button className={`${btn} border border-gray-600 text-gray-200 hover:bg-gray-800`} onClick={onClose} disabled={state.step === 'signing'}>
                    {state.step === 'done' ? 'Close' : 'Cancel'}
                </button>
            </div>
            <p className="text-xs text-gray-500">Your wallet signs and sends the transaction. This site never has access to your keys.</p>
        </section>
    );
}
