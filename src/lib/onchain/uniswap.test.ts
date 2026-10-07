import { describe, expect, it, vi } from "vitest";
import { decodeFunctionData, encodePacked, erc20Abi, type PublicClient } from "viem";
import { encodePath, minimumOut, routerAbi, swapPlan, UNISWAP, type SwapQuote } from "./uniswap";
import { bestQuote, candidateRoutes, NoRouteError } from "./quote";
import { WRAPPED_NATIVE } from "./contracts";

const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const DAI_BASE = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const WETH_BASE = WRAPPED_NATIVE.base!.address;
const ROUTER = UNISWAP.base!.router;
const NOW = Date.UTC(2026, 9, 7, 12) ;
const DEADLINE = BigInt(NOW / 1000 + 1200);
const eth = { kind: 'native' as const, symbol: 'ETH', decimals: 18 as const };
const usdc = { kind: 'erc20' as const, address: USDC_BASE as `0x${string}`, symbol: 'USDC', decimals: 6 };
const dai = { kind: 'erc20' as const, address: DAI_BASE as `0x${string}`, symbol: 'DAI', decimals: 18 };

const decodeMulticall = (data: string) => {
    const outer = decodeFunctionData({ abi: routerAbi, data: data as `0x${string}` });
    expect(outer.functionName).toBe('multicall');
    const [deadline, steps] = outer.args as [bigint, `0x${string}`[]];
    return { deadline, steps: steps.map(s => decodeFunctionData({ abi: routerAbi, data: s })) };
};

describe("swapPlan", () => {
    it("ETH → token: one call with value, swapped straight to the user", () => {
        const quote: SwapQuote = { route: { tokens: [WETH_BASE, USDC_BASE], fees: [500] }, amountIn: '1000000000000000000', amountOut: '3000000000', gasEstimate: null, allowance: null };
        const plan = swapPlan({ chain: 'base', from: eth, to: usdc, quote, slippageBps: 50, recipient: USER, now: NOW });
        expect(plan.title).toBe('Swap 1 ETH for about 3,000 USDC');
        expect(plan.description).toContain('at least 2,985 USDC (0.5% slippage)');
        expect(plan.calls).toHaveLength(1);
        expect(plan.calls[0]).toMatchObject({ to: ROUTER, value: '1000000000000000000' });
        const { deadline, steps } = decodeMulticall(plan.calls[0].data!);
        expect(deadline).toBe(DEADLINE);
        expect(steps).toEqual([{ functionName: 'exactInputSingle', args: [{ tokenIn: WETH_BASE, tokenOut: USDC_BASE, fee: 500, recipient: USER, amountIn: BigInt('1000000000000000000'), amountOutMinimum: BigInt(2_985_000_000), sqrtPriceLimitX96: BigInt(0) }] }]);
    });

    it("token → ETH: approves exactly the amount, swaps to the router, then unwraps to the user", () => {
        const quote: SwapQuote = { route: { tokens: [USDC_BASE, WETH_BASE], fees: [500] }, amountIn: '3000000000', amountOut: '1000000000000000000', gasEstimate: null, allowance: '0' };
        const plan = swapPlan({ chain: 'base', from: usdc, to: eth, quote, slippageBps: 100, recipient: USER, now: NOW });
        expect(plan.calls).toHaveLength(2);
        expect(plan.calls[0].to).toBe(USDC_BASE);
        expect(decodeFunctionData({ abi: erc20Abi, data: plan.calls[0].data as `0x${string}` })).toEqual({ functionName: 'approve', args: [ROUTER, BigInt(3_000_000_000)] });
        expect(plan.calls[1].value).toBeUndefined();
        const { steps } = decodeMulticall(plan.calls[1].data!);
        expect(steps[0].functionName).toBe('exactInputSingle');
        expect((steps[0].args![0] as { recipient: string }).recipient).toBe('0x0000000000000000000000000000000000000002');
        expect(steps[1]).toEqual({ functionName: 'unwrapWETH9', args: [BigInt('990000000000000000'), USER] });
        expect(plan.description).toContain('let Uniswap use exactly 3,000 USDC');
    });

    it("token → token through WETH with exactInput, no approval when the allowance is enough", () => {
        const route = { tokens: [USDC_BASE, WETH_BASE, DAI_BASE] as `0x${string}`[], fees: [500, 3000] };
        const quote: SwapQuote = { route, amountIn: '100000000', amountOut: '99000000000000000000', gasEstimate: null, allowance: '100000000' };
        const plan = swapPlan({ chain: 'base', from: usdc, to: dai, quote, slippageBps: 50, recipient: USER, now: NOW });
        expect(plan.calls).toHaveLength(1);
        const { steps } = decodeMulticall(plan.calls[0].data!);
        expect(steps[0]).toEqual({ functionName: 'exactInput', args: [{ path: encodePath(route), recipient: USER, amountIn: BigInt(100_000_000), amountOutMinimum: minimumOut(BigInt('99000000000000000000'), 50) }] });
        expect(encodePath(route)).toBe(encodePacked(['address', 'uint24', 'address', 'uint24', 'address'], [USDC_BASE, 500, WETH_BASE, 3000, DAI_BASE]));
    });

    it("refuses networks without Uniswap", () => {
        expect(() => swapPlan({ chain: 'linea', from: eth, to: usdc, quote: { route: { tokens: [], fees: [500] }, amountIn: '1', amountOut: '1', gasEstimate: null, allowance: null }, slippageBps: 50, recipient: USER })).toThrow();
    });
});

describe("bestQuote", () => {
    it("tries direct pools and two hops via WETH", () => {
        expect(candidateRoutes('base', USDC_BASE, DAI_BASE)).toHaveLength(8);
        expect(candidateRoutes('base', WETH_BASE, USDC_BASE)).toHaveLength(4);
    });

    it("keeps the route with the most output and reads the allowance", async () => {
        const simulateContract = vi.fn(async ({ functionName, args }: { functionName: string; args: unknown[] }) => {
            if (functionName === 'quoteExactInputSingle') {
                const fee = (args[0] as { fee: number }).fee;
                if (fee === 100) throw new Error('no pool');
                return { result: [BigInt(fee === 500 ? 990 : 900), BigInt(0), 0, BigInt(80_000)] };
            }
            return { result: [BigInt(995), [], [], BigInt(150_000)] };        // two hops win
        });
        const readContract = vi.fn(async () => BigInt(7));
        const quote = await bestQuote({ simulateContract, readContract } as unknown as PublicClient, 'base', USDC_BASE, DAI_BASE, BigInt(1000), USER);
        expect(quote).toMatchObject({ amountOut: '995', amountIn: '1000', allowance: '7', gasEstimate: '150000' });
        expect(quote.route.fees).toHaveLength(2);
        expect(readContract).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'allowance', args: [USER, ROUTER] }));
    });

    it("explains when nothing can fill the swap", async () => {
        const simulateContract = vi.fn(async () => { throw new Error('no pool'); });
        await expect(bestQuote({ simulateContract } as unknown as PublicClient, 'base', USDC_BASE, DAI_BASE, BigInt(1))).rejects.toBeInstanceOf(NoRouteError);
        await expect(bestQuote({ simulateContract } as unknown as PublicClient, 'linea', USDC_BASE, DAI_BASE, BigInt(1))).rejects.toThrow('not available');
    });
});
