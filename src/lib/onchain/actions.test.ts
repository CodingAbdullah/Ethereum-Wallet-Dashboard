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

import { lidoStakePlan, rocketPoolStakePlan, sendPlan, unwrapPlan, wrapPlan } from "./actions";
import { commonTokens, LIDO_STETH, WRAPPED_NATIVE } from "./contracts";
import { parseAbi } from "viem";

const TO = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

describe("send, wrap and stake plans", () => {
    it("sends the native coin as value and tokens with transfer()", () => {
        const eth = sendPlan('base', { kind: 'native', symbol: 'ETH' }, TO, '0.25', 'alice.eth');
        expect(eth).toMatchObject({ chain: 'base', title: 'Send 0.25 ETH to alice.eth', calls: [{ to: TO, value: '250000000000000000' }], screen: [TO] });
        const usdc = sendPlan('eth', { kind: 'erc20', address: USDC, symbol: 'USDC', decimals: 6 }, TO, '12.5');
        expect(usdc.title).toBe('Send 12.5 USDC to 0x7099…79C8');
        expect(usdc.calls[0].to).toBe(USDC);
        expect(decodeFunctionData({ abi: erc20Abi, data: usdc.calls[0].data as `0x${string}` })).toEqual({ functionName: 'transfer', args: [TO, BigInt(12_500_000)] });
    });

    it("wraps with deposit() and unwraps with withdraw()", () => {
        const weth = parseAbi(['function deposit() payable', 'function withdraw(uint256 wad)']);
        const wrap = wrapPlan('polygon', '2', 'POL');
        expect(wrap).toMatchObject({ title: 'Wrap 2 POL into WPOL', calls: [{ to: WRAPPED_NATIVE.polygon!.address, value: '2000000000000000000' }] });
        expect(decodeFunctionData({ abi: weth, data: wrap.calls[0].data as `0x${string}` }).functionName).toBe('deposit');
        const unwrap = unwrapPlan('base', '0.1', 'ETH');
        expect(decodeFunctionData({ abi: weth, data: unwrap.calls[0].data as `0x${string}` })).toEqual({ functionName: 'withdraw', args: [BigInt('100000000000000000')] });
        expect(unwrap.calls[0].value).toBeUndefined();
        expect(() => wrapPlan('hoodi', '1', 'ETH')).toThrow();
    });

    it("stakes with Lido submit() and Rocket Pool deposit() on mainnet", () => {
        const lido = lidoStakePlan('1');
        expect(lido).toMatchObject({ chain: 'eth', calls: [{ to: LIDO_STETH, value: '1000000000000000000' }] });
        expect(decodeFunctionData({ abi: parseAbi(['function submit(address _referral) payable returns (uint256)']), data: lido.calls[0].data as `0x${string}` }).functionName).toBe('submit');
        const pool = '0xCE15294273CFb9D9b628F4D61636623decDF4fdC';
        expect(rocketPoolStakePlan(pool, '0.5')).toMatchObject({ chain: 'eth', calls: [{ to: pool, value: '500000000000000000', data: '0xd0e30db0' }] });
    });

    it("offers common tokens per chain", () => {
        expect(commonTokens('eth').map(t => t.symbol)).toEqual(['USDC', 'USDT', 'DAI', 'WETH', 'stETH', 'rETH']);
        expect(commonTokens('base').map(t => t.symbol)).toEqual(['USDC', 'DAI', 'WETH']);
        expect(commonTokens('hoodi')).toEqual([]);
    });
});
