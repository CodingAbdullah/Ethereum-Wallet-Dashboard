'use client';

import { useState } from 'react';
import { encodeFunctionData, isAddress, parseEther, toFunctionSignature, type AbiFunction, type Address } from 'viem';
import { CHAINS, type ChainKey } from '@/lib/chains';
import { InputError, isRead, parseArgs } from '@/lib/onchain/abiInput';
import type { ContractAbi } from '@/lib/onchain/contractAbi';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import TxFlowPanel from './TxFlowPanel';
import { NetworkSelect, inputClass, primaryButton } from './fields';

const small = "rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-800 disabled:opacity-40";
const placeholder = (type: string) => type === 'address' ? '0x…' : type === 'bool' ? 'true or false' : /int/.test(type) && !type.endsWith(']') ? 'whole number (raw units)' : /\[|tuple/.test(type) ? 'JSON, e.g. ["0x…"]' : type;

function FunctionCard({ fn, chain, address, contractName, onWrite }: { fn: AbiFunction; chain: ChainKey; address: string; contractName: string; onWrite: (plan: TxPlan) => void }) {
    const [args, setArgs] = useState<string[]>(fn.inputs.map(() => ''));
    const [value, setValue] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const read = isRead(fn);
    const id = toFunctionSignature(fn);

    const run = async () => {
        setError(null); setResult(null);
        let parsed: unknown[];
        try { parsed = parseArgs(fn, args); }
        catch (err) { setError(err instanceof InputError ? err.message : 'Invalid input'); return; }
        if (!read) {
            if (value && !/^\d+(\.\d+)?$/.test(value)) { setError('Value must be a number like 0.1'); return; }
            onWrite({
                chain,
                title: `Call ${fn.name} on ${contractName}`,
                description: 'A function you picked yourself: read the preview carefully before signing.',
                calls: [{ to: address as Address, data: encodeFunctionData({ abi: [fn], functionName: fn.name, args: parsed } as never), value: fn.stateMutability === 'payable' && value ? parseEther(value).toString() : undefined }]
            });
            return;
        }
        setBusy(true);
        const response = await fetch('/api/contract/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chain, address, fn, args }) });
        const body = await response.json().catch(() => ({}));
        setBusy(false);
        if (response.ok) setResult(body.result);
        else setError(body.error ?? 'The call failed');
    };

    return (
        <details className="rounded-lg border border-gray-800 bg-gray-950/40 open:bg-gray-950/70">
            <summary className="cursor-pointer px-3 py-2 font-mono text-sm text-gray-100 break-all">{fn.name}<span className="text-gray-500">({fn.inputs.map(i => `${i.type}${i.name ? ' ' + i.name : ''}`).join(', ')})</span>{fn.stateMutability === 'payable' && <span className="ml-2 text-xs text-amber-300">payable</span>}</summary>
            <div className="px-3 pb-3 space-y-2">
                {fn.inputs.map((input, i) => (
                    <label key={i} className="block text-xs text-gray-400">{input.name || `arg ${i}`} <span className="text-gray-500">({input.type})</span>
                        <input value={args[i]} onChange={e => setArgs(prev => prev.map((v, j) => j === i ? e.target.value : v))} placeholder={placeholder(input.type)} className={inputClass + ' font-mono text-sm'} aria-label={`${fn.name} ${input.name || i}`} />
                    </label>
                ))}
                {fn.stateMutability === 'payable' && (
                    <label className="block text-xs text-gray-400">Value to send ({CHAINS[chain].native})
                        <input value={value} onChange={e => setValue(e.target.value.trim())} placeholder="0" className={inputClass} aria-label={`${fn.name} value`} />
                    </label>
                )}
                <button className={small} onClick={run} disabled={busy} data-fn={id}>{read ? (busy ? 'Reading…' : 'Query') : 'Review transaction'}</button>
                {error && <p className="text-sm text-red-400 break-words">{error}</p>}
                {result !== null && <pre className="bg-gray-900 border border-gray-800 rounded-md p-2 text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">{result}</pre>}
            </div>
        </details>
    );
}

export default function ContractExplorer({ initialAddress, initialChain }: { initialAddress?: string; initialChain?: ChainKey }) {
    const [chain, setChain] = useState<ChainKey>(initialChain ?? 'eth');
    const [address, setAddress] = useState(initialAddress ?? '');
    const [contract, setContract] = useState<(ContractAbi & { address: string; chain: ChainKey }) | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'read' | 'write'>('read');
    const [filter, setFilter] = useState('');
    const [plan, setPlan] = useState<TxPlan | null>(null);

    const load = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!isAddress(address.trim(), { strict: false })) { setError('Enter a contract address'); return; }
        setLoading(true); setError(null); setContract(null); setPlan(null);
        const response = await fetch('/api/contract/abi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chain, address: address.trim() }) });
        const body = await response.json().catch(() => ({}));
        setLoading(false);
        if (response.ok) setContract({ ...body, address: address.trim(), chain });
        else setError(body.error ?? 'Could not load this contract');
    };

    const functions = (contract?.functions ?? []).filter(f => (tab === 'read') === isRead(f) && f.name.toLowerCase().includes(filter.toLowerCase()));
    const reads = contract?.functions.filter(isRead).length ?? 0;
    const writes = (contract?.functions.length ?? 0) - reads;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-4 min-w-0">
            <form onSubmit={load} className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] items-end">
                <NetworkSelect value={chain} onChange={c => { setChain(c); setContract(null); }} />
                <label className="block text-sm text-gray-400">Contract address
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x…" className={inputClass + ' font-mono'} />
                </label>
                <button type="submit" className={primaryButton} disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
            </form>
            {error && <p className="text-red-400">{error}</p>}
            {contract && (
                <>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p className="text-lg text-gray-100 font-semibold">{contract.name ?? 'Contract'}</p>
                        <p>Verified on {contract.source === 'etherscan' ? 'Etherscan' : 'Sourcify'}{contract.implementation ? <> · proxy for <span className="font-mono break-all">{contract.implementation}</span></> : null}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(['read', 'write'] as const).map(t => (
                            <button key={t} onClick={() => { setTab(t); setPlan(null); }} aria-pressed={tab === t}
                                className={`rounded-full px-3 py-1 text-sm ring-1 ${tab === t ? 'bg-gray-200 text-gray-900 ring-gray-200' : 'text-gray-300 ring-gray-600 hover:bg-gray-700'}`}>
                                {t === 'read' ? `Read (${reads})` : `Write (${writes})`}
                            </button>
                        ))}
                        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter functions" aria-label="Filter functions" className="ml-auto h-9 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3 text-sm w-full sm:w-56" />
                    </div>
                    {tab === 'write' && <p className="text-sm text-amber-300">Write functions send a transaction from your wallet. Each one is simulated first, so you can see what it would do.</p>}
                    {plan && <TxFlowPanel plan={plan} onClose={() => setPlan(null)} />}
                    <div className="space-y-2">
                        {functions.length === 0 && <p className="text-gray-500">No {tab} functions{filter ? ' match' : ''}.</p>}
                        {functions.map(fn => <FunctionCard key={contract.address + toFunctionSignature(fn)} fn={fn} chain={contract.chain} address={contract.address} contractName={contract.name ?? 'contract'} onWrite={setPlan} />)}
                    </div>
                </>
            )}
        </div>
    );
}
