'use client';

import useSWR from 'swr';
import { CHAINS, type ChainKey } from '@/lib/chains';

// Small pieces shared by the action forms (send, stake, swap)

export const selectClass = "block w-full mt-1 h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3";
export const inputClass = "block w-full mt-1 h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400";
export const primaryButton = "rounded-md bg-gray-100 text-gray-900 px-5 py-2 font-medium hover:bg-white disabled:opacity-40";

export interface AssetInfo { symbol: string; name: string; decimals: number; balance: string; raw: string }

async function postJson<T>([url, body]: [string, unknown]): Promise<T> {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? 'Request failed');
    return data;
}

// The owner's balance of the native coin (no token) or an ERC20, read on-chain
export function useAsset(chain: ChainKey, owner: string | undefined, token?: string) {
    return useSWR<AssetInfo>(owner ? ['/api/asset-info', { chain, owner, token }] as [string, unknown] : null, postJson, { revalidateOnFocus: false });
}

export function NetworkSelect({ value, onChange, only, label = 'Network' }: { value: ChainKey; onChange: (c: ChainKey) => void; only?: (c: ChainKey) => boolean; label?: string }) {
    return (
        <label className="block text-sm text-gray-400">{label}
            <select value={value} onChange={e => onChange(e.target.value as ChainKey)} className={selectClass}>
                {(Object.keys(CHAINS) as ChainKey[]).filter(k => !only || only(k)).map(k => <option key={k} value={k}>{CHAINS[k].name}{CHAINS[k].testnet ? ' Testnet' : ''}</option>)}
            </select>
        </label>
    );
}

// Plain decimal amounts only ("1.5"), checked against a balance
export function amountError(amount: string, balance: string | undefined, decimals = 18): string | null {
    if (!amount) return null;
    if (!/^\d+(\.\d+)?$/.test(amount)) return 'Enter a number like 0.5';
    if ((amount.split('.')[1]?.length ?? 0) > decimals) return `At most ${decimals} decimal places`;
    if (Number(amount) <= 0) return 'Enter an amount above 0';
    if (balance !== undefined && Number(amount) > Number(balance)) return 'More than your balance';
    return null;
}

export function AmountInput({ value, onChange, balance, symbol, onMax }: { value: string; onChange: (v: string) => void; balance?: string; symbol?: string; onMax?: () => void }) {
    return (
        <label className="block text-sm text-gray-400">
            <span className="flex justify-between gap-2"><span>Amount</span>{balance !== undefined && <span>Balance: {Number(balance).toLocaleString('en-US', { maximumFractionDigits: 6 })} {symbol}</span>}</span>
            <span className="flex gap-2">
                <input inputMode="decimal" value={value} onChange={e => onChange(e.target.value.trim().replace(',', '.'))} placeholder="0.0" className={inputClass} aria-label="Amount" />
                {onMax && <button type="button" onClick={onMax} className="mt-1 h-10 rounded-md border border-gray-600 px-3 text-gray-200 hover:bg-gray-800">Max</button>}
            </span>
        </label>
    );
}

// Leaves a little of the native coin for the network fee when "Max" is pressed
export function maxNative(balance: string | undefined, reserve = 0.001): string {
    if (!balance) return '';
    const max = Number(balance) - reserve;
    return max > 0 ? String(Number(max.toFixed(6))) : '0';
}
