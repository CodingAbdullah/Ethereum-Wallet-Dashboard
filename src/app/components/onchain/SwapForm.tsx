'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, isAddress, parseUnits, type Address } from 'viem';
import { ArrowDownUp } from 'lucide-react';
import { CHAINS, chainByChainId, type ChainKey } from '@/lib/chains';
import { commonTokens } from '@/lib/onchain/contracts';
import { UNISWAP, minimumOut, swapPlan, type SwapQuote, type SwapToken } from '@/lib/onchain/uniswap';
import type { TxPlan } from '@/app/hooks/useTxFlow';
import ConnectWalletButton from '../ConnectWalletButton';
import TxFlowPanel from './TxFlowPanel';
import { AmountInput, NetworkSelect, amountError, inputClass, maxNative, primaryButton, selectClass, useAsset } from './fields';

const SWAP_CHAINS = Object.keys(UNISWAP) as ChainKey[];
const SLIPPAGE = [10, 50, 100, 300];        // basis points
const noopSubscribe = () => () => {};
const fmt = (raw: string, decimals: number) => Number(formatUnits(BigInt(raw), decimals)).toLocaleString('en-US', { maximumSignificantDigits: 8 });

function TokenPicker({ label, chain, value, onChange, other, onOther }: { label: string; chain: ChainKey; value: string; onChange: (v: string) => void; other: string; onOther: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label htmlFor={`swap-${label}`} className="block text-sm text-gray-400">{label}</label>
            <select id={`swap-${label}`} value={value} onChange={e => onChange(e.target.value)} className={selectClass + ' !mt-0'}>
                <option value="native">{CHAINS[chain].native}</option>
                {commonTokens(chain).map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
                <option value="other">Other token (paste address)…</option>
            </select>
            {value === 'other' && <input value={other} onChange={e => onOther(e.target.value.trim())} placeholder="0x… token address" aria-label={`${label} token address`} className={inputClass} />}
        </div>
    );
}

export default function SwapForm() {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { address, chainId } = useAccount();
    const walletChain = chainId ? chainByChainId(chainId)?.key as ChainKey | undefined : undefined;
    const [picked, setPicked] = useState<ChainKey | null>(null);
    const chain: ChainKey = picked ?? (walletChain && SWAP_CHAINS.includes(walletChain) ? walletChain : 'eth');
    const [fromChoice, setFromChoice] = useState('native');
    const [toChoice, setToChoice] = useState<string>(() => commonTokens('eth')[0]?.address ?? 'other');
    const [fromOther, setFromOther] = useState('');
    const [toOther, setToOther] = useState('');
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState(50);
    const [quote, setQuote] = useState<SwapQuote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoting, setQuoting] = useState(false);
    const [plan, setPlan] = useState<TxPlan | null>(null);

    const resolve = (choice: string, other: string) => choice === 'native' ? 'native' : choice === 'other' ? (isAddress(other, { strict: false }) ? other : null) : choice;
    const fromToken = resolve(fromChoice, fromOther);
    const toToken = resolve(toChoice, toOther);
    const { data: fromAsset, error: fromError, mutate: refreshFrom } = useAsset(chain, address, fromToken && fromToken !== 'native' ? fromToken : undefined);
    const { data: toAsset, error: toError, mutate: refreshTo } = useAsset(chain, address, toToken && toToken !== 'native' ? toToken : undefined);
    const problem = amountError(amount, fromAsset?.balance, fromAsset?.decimals);

    // Fetch a fresh quote shortly after the inputs change
    useEffect(() => {
        if (!address || !fromToken || !toToken || !fromAsset || !amount || problem) return;
        let cancelled = false;
        const timer = setTimeout(async () => {
            setQuoting(true);
            const response = await fetch('/api/swap/quote', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chain, tokenIn: fromToken, tokenOut: toToken, amountIn: parseUnits(amount, fromAsset.decimals).toString(), owner: address })
            });
            const body = await response.json().catch(() => ({}));
            if (cancelled) return;
            setQuoting(false);
            if (response.ok) { setQuote(body); setQuoteError(null); }
            else { setQuote(null); setQuoteError(body.issues?.join(', ') || body.error || 'No quote available'); }
        }, 500);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [address, chain, fromToken, toToken, amount, fromAsset, problem]);

    if (!mounted) return null;
    if (!address) {
        return <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center space-y-4"><p>Connect the wallet you want to swap from.</p><div className="flex justify-center"><ConnectWalletButton /></div></div>;
    }

    const reset = () => { setQuote(null); setQuoteError(null); setPlan(null); };
    const swapSides = () => { setFromChoice(toChoice); setToChoice(fromChoice); setFromOther(toOther); setToOther(fromOther); setAmount(''); reset(); };
    const asSwapToken = (token: string, info: typeof fromAsset): SwapToken | null => !info ? null : token === 'native'
        ? { kind: 'native', symbol: CHAINS[chain].native, decimals: 18 }
        : { kind: 'erc20', address: token as Address, symbol: info.symbol, decimals: info.decimals };
    const from = fromToken ? asSwapToken(fromToken, fromAsset) : null;
    const to = toToken ? asSwapToken(toToken, toAsset) : null;
    const showQuote = quote && from && to && !problem && amount;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-4 min-w-0">
            <NetworkSelect value={chain} only={c => SWAP_CHAINS.includes(c)} onChange={c => { setPicked(c); setFromChoice('native'); setToChoice(commonTokens(c)[0]?.address ?? 'other'); setAmount(''); reset(); }} />
            <TokenPicker label="From" chain={chain} value={fromChoice} onChange={v => { setFromChoice(v); reset(); }} other={fromOther} onOther={v => { setFromOther(v); reset(); }} />
            <AmountInput value={amount} onChange={v => { setAmount(v); reset(); }} balance={fromAsset?.balance} symbol={fromAsset?.symbol}
                onMax={() => setAmount(fromToken === 'native' ? maxNative(fromAsset?.balance, 0.005) : fromAsset?.balance ?? '')} />
            {problem && <p className="text-sm text-red-400">{problem}</p>}
            <div className="flex justify-center">
                <button onClick={swapSides} aria-label="Swap direction" className="rounded-full border border-gray-600 p-2 text-gray-200 hover:bg-gray-800"><ArrowDownUp className="h-4 w-4" /></button>
            </div>
            <TokenPicker label="To" chain={chain} value={toChoice} onChange={v => { setToChoice(v); reset(); }} other={toOther} onOther={v => { setToOther(v); reset(); }} />

            <div className="rounded-md border border-gray-800 bg-gray-950/40 p-3 text-sm space-y-1 min-h-12" aria-live="polite">
                {quoting && <p className="text-gray-500">Getting a quote from Uniswap…</p>}
                {(fromError || toError) && <p className="text-red-400">{String((fromError ?? toError)!.message)}</p>}
                {!quoting && quoteError && !fromError && !toError && <p className="text-red-400">{quoteError}</p>}
                {!quoting && showQuote && (
                    <>
                        <p className="text-gray-100">You get about <strong>{fmt(quote.amountOut, to.decimals)} {to.symbol}</strong></p>
                        <p className="text-gray-400">At least {fmt(minimumOut(BigInt(quote.amountOut), slippage).toString(), to.decimals)} {to.symbol} after slippage · route {quote.route.fees.map(f => f / 10_000 + '%').join(' → ')} pool{quote.route.fees.length > 1 ? 's via WETH' : ''}</p>
                    </>
                )}
                {!quoting && !quoteError && !showQuote && !fromError && !toError && <p className="text-gray-500">Enter an amount to see a quote.</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm text-gray-400 flex items-center gap-2">Slippage
                    <select value={slippage} onChange={e => { setSlippage(Number(e.target.value)); setPlan(null); }} className="h-9 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-2">
                        {SLIPPAGE.map(s => <option key={s} value={s}>{s / 100}%</option>)}
                    </select>
                </label>
                <button className={primaryButton} disabled={!showQuote || !!plan || quoting}
                    onClick={() => from && to && quote && setPlan(swapPlan({ chain, from, to, quote, slippageBps: slippage, recipient: address }))}>Review swap</button>
            </div>
            {plan && <TxFlowPanel plan={plan} onClose={() => setPlan(null)} onDone={() => { setAmount(''); setQuote(null); refreshFrom(); refreshTo(); }} />}
            <p className="text-xs text-gray-500">Quotes come straight from Uniswap v3 contracts. No extra fee is added by this site.</p>
        </div>
    );
}
