import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
vi.mock("../ens", () => ({
    resolveEnsName: vi.fn(async (name: string) => name === 'vitalik.eth' ? '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' : null),
    lookupEnsName: vi.fn(async () => 'vitalik.eth')
}));
vi.mock("../portfolio", () => ({ getWalletTokens: vi.fn() }));
vi.mock("../providers/coingecko", () => ({ getTopMarkets: vi.fn(), coingecko: vi.fn(), CG_CACHE: { lookup: 60, global: 60 } }));
vi.mock("../gas", () => ({ getGasEstimate: vi.fn() }));

import { getWalletTokens } from "../portfolio";
import { coingecko, getTopMarkets } from "../providers/coingecko";
import { getGasEstimate } from "../gas";
import { ProviderError } from "../providers/http";
import { resolveWallet, runTool, ToolError, toolErrorMessage, TOOLS } from "./index";

const VITALIK = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

beforeEach(() => vi.clearAllMocks());

describe("tool registry", () => {
    it("has unique snake_case names, descriptions and JSON-schema inputs", () => {
        expect(new Set(TOOLS.map(t => t.name)).size).toBe(TOOLS.length);
        expect(TOOLS.length).toBeGreaterThanOrEqual(20);
        for (const t of TOOLS) {
            expect(t.name).toMatch(/^[a-z][a-z0-9_]{2,40}$/);
            expect(t.description.length).toBeGreaterThan(20);
            // MCP clients and the model get the input as JSON Schema
            expect(z.toJSONSchema(t.input, { io: 'input' })).toMatchObject({ type: 'object' });
        }
    });

    it("only contains read-only tools", () => {
        const writes = /send|sign|transfer_|approve|swap|revoke|write|delete|create|execute/;
        expect(TOOLS.filter(t => writes.test(t.name))).toEqual([]);
    });
});

describe("resolveWallet", () => {
    it("checksums addresses and resolves ENS names", async () => {
        await expect(resolveWallet(VITALIK.toLowerCase())).resolves.toBe(VITALIK);
        await expect(resolveWallet('vitalik.eth')).resolves.toBe(VITALIK);
        await expect(resolveWallet('nobody.eth')).rejects.toThrow('does not resolve');
        await expect(resolveWallet('hello')).rejects.toBeInstanceOf(ToolError);
    });
});

describe("runTool", () => {
    it("validates input before calling anything", async () => {
        const err = await runTool('get_wallet_portfolio', { address: VITALIK, chain: 'solana' }).catch(e => e);
        expect(toolErrorMessage(err)).toMatch(/^Invalid input: chain/);
        expect(getWalletTokens).not.toHaveBeenCalled();
        await expect(runTool('nope', {})).rejects.toThrow('Unknown tool');
    });

    it("sorts and trims a portfolio", async () => {
        const token = (symbol: string, usdValue: number) => ({ tokenAddress: '0x' + symbol, symbol, name: symbol, logo: null, balance: 1.123456789, usdPrice: usdValue, usdValue, change24h: 1.2345, native: symbol === 'ETH' });
        vi.mocked(getWalletTokens).mockResolvedValue([token('USDC', 10), token('ETH', 3000), ...Array.from({ length: 30 }, (_, i) => token('T' + i, 0.01))]);
        const result = await runTool('get_wallet_portfolio', { address: 'vitalik.eth' }) as { totalUsd: number; tokenCount: number; tokens: { symbol: string; contract: string | null; balance: number }[] };
        expect(getWalletTokens).toHaveBeenCalledWith(VITALIK, 'eth');
        expect(result.totalUsd).toBe(3010.3);
        expect(result.tokenCount).toBe(32);
        expect(result.tokens).toHaveLength(25);
        expect(result.tokens[0]).toMatchObject({ symbol: 'ETH', contract: null, balance: 1.123457 });
    });

    it("finds prices by id, symbol or name, and falls back to CoinGecko", async () => {
        vi.mocked(getTopMarkets).mockResolvedValue([{ id: 'chainlink', symbol: 'link', name: 'Chainlink', image: '', current_price: 20, market_cap: 1, market_cap_rank: 12, total_volume: 1, price_change_percentage_24h: -3.456 }]);
        await expect(runTool('get_token_price', { coin: 'LINK' })).resolves.toMatchObject({ id: 'chainlink', usd: 20, change24hPercent: -3.46 });
        await expect(runTool('get_token_price', { coin: 'Chainlink' })).resolves.toMatchObject({ id: 'chainlink' });
        vi.mocked(coingecko).mockResolvedValue({ 'tiny-coin': { usd: 0.5, usd_24h_change: 1 } });
        await expect(runTool('get_token_price', { coin: 'tiny-coin' })).resolves.toMatchObject({ id: 'tiny-coin', usd: 0.5 });
        vi.mocked(coingecko).mockResolvedValue({});
        await expect(runTool('get_token_price', { coin: 'nothing' })).rejects.toThrow('No coin found');
    });

    it("summarizes gas", async () => {
        vi.mocked(getGasEstimate).mockResolvedValue({ currentBlockNumber: 100, blockPrices: [{ blockNumber: 101, baseFeePerGas: 1.5, estimatedPrices: [{ confidence: 99, price: 2 }] }] } as never);
        await expect(runTool('get_gas', {})).resolves.toEqual({ currentBlock: 100, nextBaseFeeGwei: 1.5, estimates: [{ confidence: 99, price: 2 }] });
    });

    it("refuses mainnet-only data on testnets", async () => {
        await expect(runTool('get_token_approvals', { address: VITALIK, chain: 'sepolia' })).rejects.toThrow('testnet');
    });
});

describe("toolErrorMessage", () => {
    it("never leaks unexpected errors", () => {
        expect(toolErrorMessage(new ToolError('Nice message'))).toBe('Nice message');
        expect(toolErrorMessage(new ProviderError('Moralis', 401, 'Moralis rejected the request'))).toContain('free plan');
        expect(toolErrorMessage(new Error('secret stack detail'))).toBe('The data source failed. Try again later.');
    });
});
