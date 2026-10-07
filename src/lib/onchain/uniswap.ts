import { encodeFunctionData, encodePacked, erc20Abi, formatUnits, parseAbi, type Address, type Hex } from "viem";
import type { ChainKey } from "../chains";
import type { TxPlan } from "@/app/hooks/useTxFlow";
import { WRAPPED_NATIVE } from "./contracts";

// Swaps through Uniswap v3, with no API key: quotes come from the on-chain QuoterV2 contract and swaps
// go through SwapRouter02. Safe in the browser (no RPC calls here; quoting is in quote.ts on the server).

export const UNISWAP: Partial<Record<ChainKey, { quoter: Address; router: Address }>> = {
    eth: { quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' },
    base: { quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', router: '0x2626664c2603336E57B271c5C0b26F421741e481' },
    arbitrum: { quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' },
    optimism: { quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' }
};

export const FEE_TIERS = [100, 500, 3000, 10000] as const;
// SwapRouter02 recipient constant: "the router itself" (used before unwrapping WETH to ETH)
const ADDRESS_THIS: Address = '0x0000000000000000000000000000000000000002';

export const routerAbi = parseAbi([
    'struct ExactInputSingleParams { address tokenIn; address tokenOut; uint24 fee; address recipient; uint256 amountIn; uint256 amountOutMinimum; uint160 sqrtPriceLimitX96; }',
    'struct ExactInputParams { bytes path; address recipient; uint256 amountIn; uint256 amountOutMinimum; }',
    'function exactInputSingle(ExactInputSingleParams params) payable returns (uint256 amountOut)',
    'function exactInput(ExactInputParams params) payable returns (uint256 amountOut)',
    'function unwrapWETH9(uint256 amountMinimum, address recipient) payable',
    'function multicall(uint256 deadline, bytes[] data) payable returns (bytes[])'
]);

export type SwapToken = { kind: 'native'; symbol: string; decimals: 18 } | { kind: 'erc20'; address: Address; symbol: string; decimals: number };

// A route is the list of tokens and fee tiers the swap goes through (one hop, or two via WETH)
export interface SwapRoute { tokens: Address[]; fees: number[] }

export interface SwapQuote {
    route: SwapRoute;
    amountIn: string;           // raw
    amountOut: string;          // raw
    gasEstimate: string | null;
    allowance: string | null;   // current allowance of the router (ERC20 input), raw
}

export const routeAddress = (chain: ChainKey, token: SwapToken): Address => {
    if (token.kind === 'erc20') return token.address;
    const wrapped = WRAPPED_NATIVE[chain];
    if (!wrapped) throw new Error('Swaps are not available on this network');
    return wrapped.address;
};

export const encodePath = (route: SwapRoute): Hex => {
    const types: ('address' | 'uint24')[] = [];
    const values: (Address | number)[] = [];
    route.tokens.forEach((token, i) => {
        types.push('address'); values.push(token);
        if (i < route.fees.length) { types.push('uint24'); values.push(route.fees[i]); }
    });
    return encodePacked(types, values);
};

// Lowest acceptable output for a slippage tolerance in basis points (50 = 0.5%)
export const minimumOut = (amountOut: bigint, slippageBps: number) => amountOut * BigInt(10_000 - slippageBps) / BigInt(10_000);

export function swapPlan(options: {
    chain: ChainKey; from: SwapToken; to: SwapToken; quote: SwapQuote; slippageBps: number; recipient: Address; now?: number;
}): TxPlan {
    const { chain, from, to, quote, slippageBps, recipient } = options;
    const router = UNISWAP[chain]?.router;
    if (!router) throw new Error('Swaps are not available on this network');
    const amountIn = BigInt(quote.amountIn);
    const minOut = minimumOut(BigInt(quote.amountOut), slippageBps);
    const toNative = to.kind === 'native';
    const swapRecipient = toNative ? ADDRESS_THIS : recipient;

    const swap = quote.route.fees.length === 1
        ? encodeFunctionData({ abi: routerAbi, functionName: 'exactInputSingle', args: [{ tokenIn: quote.route.tokens[0], tokenOut: quote.route.tokens[1], fee: quote.route.fees[0], recipient: swapRecipient, amountIn, amountOutMinimum: minOut, sqrtPriceLimitX96: BigInt(0) }] })
        : encodeFunctionData({ abi: routerAbi, functionName: 'exactInput', args: [{ path: encodePath(quote.route), recipient: swapRecipient, amountIn, amountOutMinimum: minOut }] });
    const steps: Hex[] = [swap];
    if (toNative) steps.push(encodeFunctionData({ abi: routerAbi, functionName: 'unwrapWETH9', args: [minOut, recipient] }));

    // The swap must happen within 20 minutes of signing, or it reverts (stale prices)
    const deadline = BigInt(Math.floor((options.now ?? Date.now()) / 1000) + 20 * 60);
    const calls: TxPlan['calls'] = [];
    if (from.kind === 'erc20' && BigInt(quote.allowance ?? 0) < amountIn) {
        // Approve exactly this amount, never unlimited
        calls.push({ to: from.address, data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [router, amountIn] }) });
    }
    calls.push({ to: router, data: encodeFunctionData({ abi: routerAbi, functionName: 'multicall', args: [deadline, steps] }), value: from.kind === 'native' ? amountIn.toString() : undefined });

    const inText = `${trim(formatUnits(amountIn, from.decimals))} ${from.symbol}`;
    const outText = `${trim(formatUnits(BigInt(quote.amountOut), to.decimals))} ${to.symbol}`;
    return {
        chain,
        title: `Swap ${inText} for about ${outText}`,
        description: `Through Uniswap v3. You get at least ${trim(formatUnits(minOut, to.decimals))} ${to.symbol} (${slippageBps / 100}% slippage), or the swap is cancelled.${calls.length > 1 ? ` First, your wallet asks you to let Uniswap use exactly ${inText}.` : ''}`,
        calls
    };
}

const trim = (s: string) => {
    const n = Number(s);
    return n >= 1 ? n.toLocaleString('en-US', { maximumFractionDigits: 6 }) : Number(n.toPrecision(6)).toString();
};
