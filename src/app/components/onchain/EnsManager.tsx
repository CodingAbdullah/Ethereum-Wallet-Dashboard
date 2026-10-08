'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, isAddress, isAddressEqual, toHex, type Address, type Hex } from 'viem';
import { commitPlan, primaryNamePlan, recordsPlan, registerPlan, renewPlan, TEXT_KEYS } from '@/lib/onchain/ens';
import type { EnsNameStatus } from '@/lib/onchain/ensStatus';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';
import TxFlowPanel from './TxFlowPanel';
import { inputClass, primaryButton } from './fields';

const noopSubscribe = () => () => {};
const small = "rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-800 disabled:opacity-40";
const TEXT_LABELS: Record<string, string> = { avatar: 'Avatar URL', url: 'Website', description: 'Description', email: 'Email', 'com.twitter': 'X (Twitter)', 'com.github': 'GitHub' };

interface PendingCommit { secret: Hex; committedAt: number; minAge: number; years: number; setPrimary: boolean }
const storageKey = (name: string, owner: string) => `ens-register:${name}:${owner.toLowerCase()}`;
function loadPending(name: string, owner: string): PendingCommit | null {
    try {
        const raw = localStorage.getItem(storageKey(name, owner));
        const p = raw ? JSON.parse(raw) as PendingCommit : null;
        return p && Date.now() - p.committedAt < 23 * 3600_000 ? p : null;      // commitments expire after 24h
    }
    catch { return null; }
}
const savePending = (name: string, owner: string, p: PendingCommit | null) => {
    try { if (p) localStorage.setItem(storageKey(name, owner), JSON.stringify(p)); else localStorage.removeItem(storageKey(name, owner)); }
    catch { /* storage blocked: the user keeps the page open instead */ }
};

function Register({ status, owner, onPlan }: { status: EnsNameStatus; owner: Address; onPlan: (p: TxPlan, after?: () => void) => void }) {
    const [years, setYears] = useState(1);
    const [setPrimary, setSetPrimary] = useState(true);
    const [pending, setPending] = useState<PendingCommit | null>(() => loadPending(status.name, owner));
    const [now, setNow] = useState(() => Date.now());
    const [error, setError] = useState<string | null>(null);
    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

    const price = BigInt(status.yearlyPrice ?? 0) * BigInt(years);
    const commit = async () => {
        setError(null);
        const secret = toHex(crypto.getRandomValues(new Uint8Array(32)));
        const response = await fetch('/api/ens/commitment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: status.label, owner, years, secret, setPrimary }) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) { setError(body.error ?? 'Could not prepare the registration'); return; }
        onPlan(commitPlan(status.name, body.commitment), () => {
            const p = { secret, committedAt: Date.now(), minAge: body.minCommitmentAge, years, setPrimary };
            savePending(status.name, owner, p);
            setPending(p);
        });
    };

    if (pending) {
        const ready = pending.committedAt + (pending.minAge + 5) * 1000;
        const wait = Math.max(0, Math.ceil((ready - now) / 1000));
        return (
            <div className="space-y-2">
                <p className="text-gray-300">Step 1 is done. {wait > 0 ? `Wait ${wait}s, then finish the registration.` : 'Finish the registration now (within 24 hours).'}</p>
                <div className="flex gap-2">
                    <button className={primaryButton} disabled={wait > 0} onClick={() => onPlan(registerPlan({ label: status.label, owner, years: pending.years, secret: pending.secret, price: BigInt(status.yearlyPrice ?? 0) * BigInt(pending.years), setPrimary: pending.setPrimary }), () => { savePending(status.name, owner, null); setPending(null); })}>
                        Register {status.name}
                    </button>
                    <button className={small} onClick={() => { savePending(status.name, owner, null); setPending(null); }}>Start over</button>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-3">
            <p className="text-green-300 font-medium">{status.name} is available.</p>
            <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm text-gray-400">Years
                    <select value={years} onChange={e => setYears(Number(e.target.value))} className="block mt-1 h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3">
                        {[1, 2, 3, 5].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 h-10"><input type="checkbox" checked={setPrimary} onChange={e => setSetPrimary(e.target.checked)} className="h-4 w-4 accent-gray-200" /> Make it my primary name</label>
            </div>
            <p className="text-sm text-gray-400">About {Number(formatEther(price)).toFixed(5)} ETH plus network fees, in two transactions about a minute apart.</p>
            <button className={primaryButton} onClick={commit}>Start registration</button>
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}

function Records({ status, onPlan }: { status: EnsNameStatus; onPlan: (p: TxPlan) => void }) {
    const [addr, setAddr] = useState(status.records.addr ?? '');
    const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries(TEXT_KEYS.map(k => [k, status.records.texts[k] ?? ''])));
    const changedTexts = Object.fromEntries(TEXT_KEYS.filter(k => (texts[k] ?? '') !== (status.records.texts[k] ?? '')).map(k => [k, texts[k]]));
    const addrChanged = addr.trim() !== (status.records.addr ?? '') && isAddress(addr.trim(), { strict: false });
    const changes = Object.keys(changedTexts).length + (addrChanged ? 1 : 0);
    if (!status.resolver) return <p className="text-sm text-gray-400">This name has no resolver yet. Set one in the ENS app first, then edit records here.</p>;
    return (
        <div className="space-y-3">
            <label className="block text-sm text-gray-400">ETH address
                <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="0x…" className={inputClass + ' font-mono'} />
            </label>
            {addr && !isAddress(addr.trim(), { strict: false }) && <p className="text-sm text-red-400">Not a valid address</p>}
            <div className="grid gap-3 sm:grid-cols-2">
                {TEXT_KEYS.map(k => (
                    <label key={k} className="block text-sm text-gray-400">{TEXT_LABELS[k]}
                        <input value={texts[k]} onChange={e => setTexts(prev => ({ ...prev, [k]: e.target.value }))} className={inputClass} maxLength={500} />
                    </label>
                ))}
            </div>
            <button className={primaryButton} disabled={changes === 0} onClick={() => onPlan(recordsPlan(status.name, status.resolver!, { addr: addrChanged ? addr.trim() as Address : undefined, texts: changedTexts }))}>
                Save {changes || ''} change{changes === 1 ? '' : 's'}
            </button>
        </div>
    );
}

export default function EnsManager() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { address } = useAccount();
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<EnsNameStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<{ plan: TxPlan; after?: () => void } | null>(null);
    const [renewYears, setRenewYears] = useState(1);

    const lookup = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        setLoading(true); setError(null); setPlan(null);
        const response = await fetch('/api/ens/name', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: input }) });
        const body = await response.json().catch(() => ({}));
        setLoading(false);
        if (response.ok) setStatus(body); else { setStatus(null); setError(body.error ?? 'Could not look up this name'); }
    };

    if (!mounted) return null;
    const isOwner = !!(address && status?.owner && isAddressEqual(address, status.owner));
    const taken = !!status && (status.available === false || !status.isSecondLevel);
    const pointsHere = !!(address && status?.records.addr && isAddressEqual(address, status.records.addr));
    const open = (p: TxPlan, after?: () => void) => setPlan({ plan: p, after });

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-5 min-w-0">
            {!address && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-gray-400">Connect a wallet to register or manage names.</p><ConnectWalletButton /></div>}
            <form onSubmit={lookup} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="name.eth" aria-label="ENS name" className={inputClass + ' !mt-0'} />
                <button className={primaryButton} disabled={loading}>{loading ? 'Checking…' : 'Check'}</button>
            </form>
            {error && <p className="text-red-400">{error}</p>}

            {status && status.isSecondLevel && status.available === null && (
                <p className="text-amber-300">Couldn&apos;t check {status.name} right now (the Ethereum RPC didn&apos;t answer). Try again in a moment.</p>
            )}
            {status && (status.available !== null || !status.isSecondLevel) && (
                <div className="space-y-5">
                    {status.isSecondLevel && !status.controllerAuthorized && (
                        <p className="rounded-md border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
                            ENS has moved registrations and renewals to a new contract that this site doesn&apos;t support yet. Use <a className="underline" href={`https://app.ens.domains/${status.name}`} target="_blank" rel="noopener noreferrer">app.ens.domains</a> for those.
                        </p>
                    )}
                    {status.isSecondLevel && status.available && status.controllerAuthorized && (
                        address ? <Register key={status.name + address} status={status} owner={address} onPlan={open} /> : <p className="text-green-300">{status.name} is available. Connect a wallet to register it.</p>
                    )}
                    {taken && (
                        <div className="space-y-1 text-sm">
                            <p className="text-lg text-gray-100 font-semibold">{status.name}</p>
                            <p className="text-gray-400">Owner: <span className="font-mono break-all">{status.owner ?? 'none'}</span>{isOwner ? ' (you)' : ''}</p>
                            {status.expires && <p className="text-gray-400">Expires {new Date(status.expires).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>}
                            {status.records.addr && <p className="text-gray-400">Points to <span className="font-mono break-all">{status.records.addr}</span></p>}
                        </div>
                    )}
                    {taken && status.isSecondLevel && status.controllerAuthorized && status.yearlyPrice && address && (
                        <div className="flex flex-wrap items-end gap-3 border-t border-gray-800 pt-4">
                            <label className="text-sm text-gray-400">Renew for
                                <select value={renewYears} onChange={e => setRenewYears(Number(e.target.value))} className="block mt-1 h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3">
                                    {[1, 2, 3, 5].map(y => <option key={y} value={y}>{y} year{y === 1 ? '' : 's'}</option>)}
                                </select>
                            </label>
                            <button className={small} onClick={() => open(renewPlan(status.label, renewYears, BigInt(status.yearlyPrice!) * BigInt(renewYears)))}>
                                Renew (about {Number(formatEther(BigInt(status.yearlyPrice) * BigInt(renewYears))).toFixed(5)} ETH)
                            </button>
                        </div>
                    )}
                    {taken && address && (
                        <div className="border-t border-gray-800 pt-4 space-y-2">
                            <h3 className="text-gray-100 font-semibold">Primary name</h3>
                            {pointsHere
                                ? <button className={small} onClick={() => open(primaryNamePlan(status.name))}>Set {status.name} as my primary name</button>
                                : <p className="text-sm text-gray-400">To use it as your primary name, its ETH address must point to your wallet{isOwner ? ': update the ETH address record below first.' : '.'}</p>}
                        </div>
                    )}
                    {taken && isOwner && (
                        <div className="border-t border-gray-800 pt-4 space-y-2">
                            <h3 className="text-gray-100 font-semibold">Records</h3>
                            <Records key={status.name} status={status} onPlan={open} />
                        </div>
                    )}
                    {plan && <TxFlowPanel plan={plan.plan} onClose={() => setPlan(null)} onDone={() => { plan.after?.(); lookup(); }} />}
                </div>
            )}
        </div>
    );
}
