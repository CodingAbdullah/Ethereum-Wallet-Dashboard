import { describe, expect, it, vi } from "vitest";
import { decodeFunctionData, erc20Abi, type PublicClient } from "viem";
import { revokePlan } from "./actions";
import { withLiveAllowances } from "./approvals";
import type { TokenApproval } from "../walletInsights";

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const approval = (tokenAddress: string, tokenSymbol: string): TokenApproval => ({
    tokenAddress, tokenSymbol, tokenName: tokenSymbol, tokenLogo: null, spender: ROUTER, spenderLabel: 'Uniswap V2: Router 2',
    amount: 'Unlimited', unlimited: true, usdAtRisk: 10, approvedAt: null, transactionHash: null
});

describe("revokePlan", () => {
    it("sets each allowance to 0", () => {
        const one = revokePlan('base', [{ tokenAddress: USDC, tokenSymbol: 'USDC', spender: ROUTER, spenderLabel: 'Uniswap V2: Router 2' }]);
        expect(one).toMatchObject({ chain: 'base', title: 'Revoke USDC approval for Uniswap V2: Router 2' });
        expect(one.calls[0].to).toBe(USDC);
        expect(decodeFunctionData({ abi: erc20Abi, data: one.calls[0].data as `0x${string}` })).toEqual({ functionName: 'approve', args: [ROUTER, BigInt(0)] });

        const many = revokePlan('eth', [{ tokenAddress: USDC, tokenSymbol: 'USDC', spender: ROUTER, spenderLabel: null }, { tokenAddress: DAI, tokenSymbol: 'DAI', spender: ROUTER, spenderLabel: null }]);
        expect(many.title).toBe('Revoke 2 approvals');
        expect(many.calls.map(c => c.to)).toEqual([USDC, DAI]);
    });
});

describe("withLiveAllowances", () => {
    it("drops approvals already at zero on-chain", async () => {
        const multicall = vi.fn(async () => [{ status: 'success', result: BigInt(0) }, { status: 'success', result: BigInt(5) }]);
        const result = await withLiveAllowances({ multicall } as unknown as PublicClient, OWNER, [approval(USDC, 'USDC'), approval(DAI, 'DAI')]);
        expect(result).toEqual({ approvals: [approval(DAI, 'DAI')], verified: true });
    });

    it("keeps the list when an allowance can't be read, or the multicall fails", async () => {
        const partial = await withLiveAllowances({ multicall: vi.fn(async () => [{ status: 'failure', error: new Error('x') }]) } as unknown as PublicClient, OWNER, [approval(USDC, 'USDC')]);
        expect(partial.approvals).toHaveLength(1);
        const down = await withLiveAllowances({ multicall: vi.fn(async () => { throw new Error('rpc down'); }) } as unknown as PublicClient, OWNER, [approval(USDC, 'USDC')]);
        expect(down).toEqual({ approvals: [approval(USDC, 'USDC')], verified: false });
    });
});
