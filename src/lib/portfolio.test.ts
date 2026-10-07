import { describe, expect, it } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { combinePortfolio, getWalletPortfolio, toHoldings, type WalletPortfolio } from "./portfolio";

const WALLET = { id: 1, address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', chain: 'eth', label: 'Main' };

const moralisTokens = {
    result: [
        { token_address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', symbol: 'ETH', name: 'Ether', logo: null, balance_formatted: '2', usd_price: 3000, usd_value: 6000, usd_price_24hr_percent_change: 1.5, native_token: true },
        { token_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', logo: null, balance_formatted: '100', usd_price: 1, usd_value: 100, usd_price_24hr_percent_change: 0, native_token: false },
        { token_address: '0x0000000000000000000000000000000000000001', symbol: 'DUST', name: 'Dust', logo: null, balance_formatted: '0', usd_price: null, usd_value: null, usd_price_24hr_percent_change: null, native_token: false }
    ]
};

const txs = { status: '1', message: 'OK', result: [
    { hash: '0xaa', timeStamp: '1700000000', from: WALLET.address, to: '0x1', value: '1000000000000000000', isError: '0' }
] };

// Routes each provider call to a canned response by URL
function routeFetch(routes: Record<string, () => Response>) {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        const match = Object.keys(routes).find(key => url.includes(key));
        if (!match) throw new Error('Unexpected fetch ' + url);
        return routes[match]();
    });
    return fetchMock;
}

describe("toHoldings", () => {
    it("normalizes, drops zero balances and sorts by value", () => {
        const holdings = toHoldings(moralisTokens.result);
        expect(holdings.map(h => h.symbol)).toEqual(['ETH', 'USDC']);
        expect(holdings[0]).toMatchObject({ tokenAddress: 'native', balance: 2, usdValue: 6000, native: true });
        expect(holdings[1].tokenAddress).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
    });
});

describe("getWalletPortfolio", () => {
    it("loads every section", async () => {
        routeFetch({
            '/tokens?': () => json(moralisTokens),
            '/nft?': () => json({ cursor: 'next', result: [{ token_address: '0xnft', token_id: '7', name: 'Punk' }] }),
            '/profitability/summary': () => json({ total_realized_profit_usd: '12.5', total_realized_profit_percentage: 3, total_trade_volume: '1000', total_count_of_trades: 4 }),
            'etherscan.io': () => json(txs)
        });

        const result = await getWalletPortfolio(WALLET);
        expect(result.usdValue).toBe(6100);
        expect(result.nfts).toEqual({ data: { items: [{ tokenAddress: '0xnft', tokenId: '7', name: 'Punk' }], hasMore: true } });
        expect(result.pnl).toEqual({ data: { realizedProfitUsd: 12.5, realizedProfitPercent: 3, tradeVolumeUsd: 1000, trades: 4 } });
        expect(result.activity).toEqual({ data: [expect.objectContaining({ hash: '0xaa', valueEth: 1, failed: false })] });
    });

    it("keeps the other sections when PnL is outside the free plan", async () => {
        routeFetch({
            '/tokens?': () => json(moralisTokens),
            '/nft?': () => json({ cursor: null, result: [] }),
            '/profitability/summary': () => json({ message: 'Upgrade' }, 403),
            'etherscan.io': () => json(txs)
        });

        const result = await getWalletPortfolio(WALLET);
        expect(result.pnl).toEqual({ error: expect.stringContaining('free plan') });
        expect(result.usdValue).toBe(6100);
        expect('data' in result.activity).toBe(true);
    });

    it("has no value when holdings fail, and no PnL or value on testnets", async () => {
        routeFetch({
            '/tokens?': () => json({}, 403),
            '/nft?': () => json({ cursor: null, result: [] }),
            'etherscan.io': () => json(txs)
        });
        const testnet = await getWalletPortfolio({ ...WALLET, chain: 'sepolia' });
        expect(testnet.pnl).toBeNull();
        expect(testnet.usdValue).toBeNull();
        expect(testnet.tokens).toEqual({ error: expect.any(String) });
    });
});

describe("combinePortfolio", () => {
    const wallet = (id: number, address: string, chain: string, usdc: number, timestamp: number): WalletPortfolio => ({
        wallet: { id, address, chain, label: null },
        usdValue: chain === 'eth' ? usdc : 0,
        tokens: { data: [{ tokenAddress: '0xusdc', symbol: 'USDC', name: 'USD Coin', logo: null, balance: usdc, usdPrice: 1, usdValue: usdc, change24h: 0, native: false }] },
        nfts: { data: { items: [], hasMore: false } },
        pnl: null,
        activity: { data: [{ hash: '0x' + id, timestamp, from: address, to: '0x0', valueEth: 0, failed: false }] }
    });

    it("sums mainnet value, merges holdings by token and sorts activity", () => {
        const combined = combinePortfolio([wallet(1, '0xa', 'eth', 100, 10), wallet(2, '0xb', 'eth', 50, 30), wallet(3, '0xc', 'sepolia', 999, 20)]);
        expect(combined.totalUsd).toBe(150);
        expect(combined.incomplete).toBe(false);
        expect(combined.holdings).toHaveLength(1);
        expect(combined.holdings[0]).toMatchObject({ balance: 150, usdValue: 150, wallets: 2 });
        expect(combined.activity.map(a => a.hash)).toEqual(['0x2', '0x3', '0x1']);
    });

    it("flags a total that is missing a wallet", () => {
        const failed = { ...wallet(1, '0xa', 'eth', 100, 10), usdValue: null, tokens: { error: 'Moralis is unavailable right now' } };
        const combined = combinePortfolio([failed, wallet(2, '0xb', 'eth', 50, 30)]);
        expect(combined.totalUsd).toBe(50);
        expect(combined.incomplete).toBe(true);
    });
});
