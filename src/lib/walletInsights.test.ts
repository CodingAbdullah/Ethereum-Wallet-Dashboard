import { describe, expect, it } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import fixture from "@/test/fixtures/moralis-wallet-insights.json";
import { getWalletInsights, toActivity, toApprovals, toDefiPositions } from "./walletInsights";

const A = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const B = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

describe("toApprovals", () => {
    it("flags unlimited approvals, labels spenders, drops spam and sorts by value at risk", () => {
        const approvals = toApprovals(fixture.approvals);
        expect(approvals.map(a => a.tokenSymbol)).toEqual(['USDC', 'USDT']);
        expect(approvals[0]).toMatchObject({ unlimited: true, amount: 'Unlimited', usdAtRisk: 1500.25, spenderLabel: 'Uniswap V2: Router 2', tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' });
        // Moralis gave no label for this spender; the curated list names it
        expect(approvals[1]).toMatchObject({ unlimited: false, amount: '5', spenderLabel: '1inch v5: Aggregation Router' });
    });

    it("tolerates missing or malformed data", () => {
        expect(toApprovals(undefined)).toEqual([]);
        expect(toApprovals({ result: [null, { token: {} }] })).toEqual([]);
    });
});

describe("toDefiPositions", () => {
    it("reads protocols, tokens and values, largest first", () => {
        const positions = toDefiPositions(fixture.defi);
        expect(positions.map(p => p.protocol)).toEqual(['Lido', 'Uniswap v2']);
        expect(positions[0]).toMatchObject({ label: 'staking', usdValue: 6100, unclaimedUsd: 12.5 });
        expect(positions[1].tokens).toEqual([{ symbol: 'WETH', balance: 1, usdValue: 3000 }, { symbol: 'USDC', balance: 3000, usdValue: 3000 }]);
    });

    it("accepts a { result } wrapper", () => {
        expect(toDefiPositions({ result: fixture.defi })).toHaveLength(2);
    });
});

describe("toActivity", () => {
    it("keeps readable summaries and drops spam", () => {
        const items = toActivity(fixture.history);
        expect(items.map(i => i.hash)).toEqual(['0xh1', '0xh2', '0xh4']);
        expect(items[0]).toMatchObject({ category: 'token swap', summary: 'Swapped 1 ETH for 3,200 USDC' });
        expect(items[2].summary).toBe('multicall');
    });
});

describe("getWalletInsights", () => {
    it("combines wallets and reports the ones that failed", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes(B)) return json({}, 500);
            if (url.includes('/approvals')) return json(fixture.approvals);
            if (url.includes('/defi/positions')) return json(fixture.defi);
            if (url.includes('/history')) return json(fixture.history);
            throw new Error('Unexpected ' + url);
        });

        const insights = await getWalletInsights([{ address: A, chain: 'eth' }, { address: B, chain: 'eth' }]);
        expect(insights.approvals.items).toHaveLength(2);
        expect(insights.approvals.items[0].wallet).toBe(A);
        expect(insights.approvals.failed).toEqual([B]);
        expect(insights.defi.totalUsd).toBe(12100);
        expect(insights.defi.failed).toEqual([B]);
        expect(insights.activity.items.map(i => i.hash)).toEqual(['0xh1', '0xh2', '0xh4']);
        expect(insights.activity.failed).toEqual([B]);
    });

    it("only loads activity for testnet wallets", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/history') && url.includes('chain=sepolia')) return json(fixture.history);
            throw new Error('Unexpected ' + url);
        });

        const insights = await getWalletInsights([{ address: A, chain: 'sepolia' }]);
        expect(insights.approvals.items).toEqual([]);
        expect(insights.defi.items).toEqual([]);
        expect(insights.activity.items[0]).toMatchObject({ chain: 'sepolia', wallet: A });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
