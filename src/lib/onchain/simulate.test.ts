import { describe, expect, it, vi } from "vitest";
import { encodeFunctionData, erc20Abi, maxUint256, parseEther, type PublicClient } from "viem";
import { simulateCalls } from "./simulate";
import { addressFlags, callFlags, counterparties } from "./risks";

const FROM = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const TOKEN = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const UNISWAP = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';     // labelled
const STRANGER = '0x1111111111111111111111111111111111111111';

const client = (impl: Partial<PublicClient>) => impl as unknown as PublicClient;

describe("simulateCalls", () => {
    it("returns balance changes and gas from eth_simulateV1", async () => {
        const c = client({
            simulateCalls: vi.fn(async () => ({
                results: [{ status: 'success', gasUsed: BigInt(46000) }, { status: 'success', gasUsed: BigInt(120000) }],
                assetChanges: [
                    { token: { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, symbol: 'ETH' }, value: { pre: BigInt(0), post: BigInt(0), diff: -parseEther('0.5') } },
                    { token: { address: TOKEN, decimals: 6, symbol: 'USDC' }, value: { pre: BigInt(0), post: BigInt(0), diff: BigInt(1_250_000_000) } },
                    { token: { address: STRANGER, decimals: 18, symbol: 'X' }, value: { pre: BigInt(5), post: BigInt(5), diff: BigInt(0) } }
                ]
            })) as never
        });
        const sim = await simulateCalls(c, FROM, [{ to: TOKEN }, { to: UNISWAP }], 'POL');
        expect(sim).toMatchObject({ supported: true, ok: true, gasUsed: '166000', error: null });
        expect(sim.assetChanges).toEqual([
            { token: 'native', symbol: 'POL', decimals: 18, diff: '-500000000000000000', amount: -0.5 },
            { token: TOKEN, symbol: 'USDC', decimals: 6, diff: '1250000000', amount: 1250 }
        ]);
    });

    it("reports which call fails and why", async () => {
        const c = client({ simulateCalls: vi.fn(async () => ({ results: [{ status: 'success', gasUsed: BigInt(1) }, { status: 'failure', gasUsed: BigInt(1), error: { shortMessage: 'execution reverted: STF' } }], assetChanges: [] })) as never });
        const sim = await simulateCalls(c, FROM, [{ to: TOKEN }, { to: UNISWAP }]);
        expect(sim.ok).toBe(false);
        expect(sim.calls[1]).toMatchObject({ ok: false, error: 'execution reverted: STF' });
        expect(sim.error).toBe('execution reverted: STF');
    });

    it("falls back to gas estimation when the RPC has no eth_simulateV1", async () => {
        const c = client({
            simulateCalls: vi.fn(async () => { throw new Error('the method eth_simulateV1 does not exist/is not available'); }) as never,
            estimateGas: vi.fn(async () => BigInt(21000)) as never
        });
        expect(await simulateCalls(c, FROM, [{ to: STRANGER, value: BigInt(1) }])).toMatchObject({ supported: false, ok: true, gasUsed: '21000', assetChanges: [] });
    });

    it("treats other errors as a failed simulation", async () => {
        const c = client({ simulateCalls: vi.fn(async () => { throw Object.assign(new Error('x'), { shortMessage: 'insufficient funds for gas * price + value' }); }) as never });
        expect(await simulateCalls(c, FROM, [{ to: STRANGER }])).toMatchObject({ supported: true, ok: false, error: 'insufficient funds for gas * price + value' });
    });
});

describe("risk flags", () => {
    const approve = (spender: string, amount: bigint) => ({ to: TOKEN as `0x${string}`, data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender as `0x${string}`, amount] }) });

    it("flags unlimited approvals, stronger for unknown spenders, but not revokes", () => {
        expect(callFlags([approve(STRANGER, maxUint256)])[0]).toMatchObject({ level: 'danger' });
        expect(callFlags([approve(UNISWAP, maxUint256)])[0]).toMatchObject({ level: 'warning', text: expect.stringContaining('Uniswap') });
        expect(callFlags([approve(STRANGER, BigInt(0))])).toEqual([]);
        expect(callFlags([approve(STRANGER, BigInt(100))])).toEqual([]);
    });

    it("flags tokens sent to their own contract and approval for all NFTs", () => {
        const transfer = { to: TOKEN as `0x${string}`, data: encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [TOKEN, BigInt(1)] }) };
        expect(callFlags([transfer])[0].text).toContain('token contract itself');
        const forAll = { to: TOKEN as `0x${string}`, data: '0xa22cb4650000000000000000000000001111111111111111111111111111111111111111' + '0'.repeat(63) + '1' as `0x${string}` };
        expect(callFlags([forAll])[0]).toMatchObject({ level: 'danger' });
    });

    it("finds the counterparties to screen", () => {
        expect(counterparties([{ to: STRANGER, value: BigInt(1) }, approve(UNISWAP, BigInt(0))])).toEqual([STRANGER, UNISWAP.toLowerCase()]);
    });

    it("turns GoPlus address results into a warning", () => {
        expect(addressFlags(STRANGER, { phishing_activities: '1', sanctioned: '1', mixer: '0' })[0]).toMatchObject({ level: 'danger', text: expect.stringContaining('phishing, being sanctioned') });
        expect(addressFlags(STRANGER, { phishing_activities: '0' })).toEqual([]);
        expect(addressFlags(STRANGER, undefined)).toEqual([]);
    });
});
