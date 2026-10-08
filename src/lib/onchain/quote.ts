import { erc20Abi, isAddressEqual, parseAbi, type Address, type PublicClient } from "viem";
import type { ChainKey } from "../chains";
import { WRAPPED_NATIVE } from "./contracts";
import { encodePath, FEE_TIERS, UNISWAP, type SwapQuote, type SwapRoute } from "./uniswap";

// Best Uniswap v3 quote, read from the QuoterV2 contract (eth_call, no API key).
// Tries every fee tier directly, and two hops through WETH, and keeps the route with the most output.

const quoterAbi = parseAbi([
    'struct QuoteExactInputSingleParams { address tokenIn; address tokenOut; uint256 amountIn; uint24 fee; uint160 sqrtPriceLimitX96; }',
    'function quoteExactInputSingle(QuoteExactInputSingleParams params) returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
    'function quoteExactInput(bytes path, uint256 amountIn) returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)'
]);

const HOP_FEES = [500, 3000] as const;

export function candidateRoutes(chain: ChainKey, tokenIn: Address, tokenOut: Address): SwapRoute[] {
    const routes: SwapRoute[] = FEE_TIERS.map(fee => ({ tokens: [tokenIn, tokenOut], fees: [fee] }));
    const weth = WRAPPED_NATIVE[chain]?.address;
    if (weth && !isAddressEqual(tokenIn, weth) && !isAddressEqual(tokenOut, weth)) {
        for (const a of HOP_FEES) for (const b of HOP_FEES) routes.push({ tokens: [tokenIn, weth, tokenOut], fees: [a, b] });
    }
    return routes;
}

export class NoRouteError extends Error {}

export async function bestQuote(client: PublicClient, chain: ChainKey, tokenIn: Address, tokenOut: Address, amountIn: bigint, owner?: Address, inputIsNative = false): Promise<SwapQuote> {
    const uni = UNISWAP[chain];
    if (!uni) throw new NoRouteError('Swaps are not available on this network');
    if (isAddressEqual(tokenIn, tokenOut)) throw new NoRouteError('Pick two different tokens');

    const routes = candidateRoutes(chain, tokenIn, tokenOut);
    const results = await Promise.allSettled(routes.map(async route => {
        const { result } = route.fees.length === 1
            ? await client.simulateContract({ address: uni.quoter, abi: quoterAbi, functionName: 'quoteExactInputSingle', args: [{ tokenIn, tokenOut, amountIn, fee: route.fees[0], sqrtPriceLimitX96: BigInt(0) }] })
            : await client.simulateContract({ address: uni.quoter, abi: quoterAbi, functionName: 'quoteExactInput', args: [encodePath(route), amountIn] });
        return { route, amountOut: result[0], gasEstimate: result[3] };
    }));
    const best = results
        .flatMap(r => r.status === 'fulfilled' && r.value.amountOut > BigInt(0) ? [r.value] : [])
        .sort((a, b) => (b.amountOut > a.amountOut ? 1 : b.amountOut < a.amountOut ? -1 : 0))[0];
    if (!best) throw new NoRouteError('No Uniswap pool can fill this swap. Try a smaller amount or another token.');

    let allowance: bigint | null = null;
    if (owner && !inputIsNative) {
        allowance = await client.readContract({ address: tokenIn, abi: erc20Abi, functionName: 'allowance', args: [owner, uni.router] }).catch(() => null);
    }
    return { route: best.route, amountIn: amountIn.toString(), amountOut: best.amountOut.toString(), gasEstimate: best.gasEstimate.toString(), allowance: allowance?.toString() ?? null };
}
