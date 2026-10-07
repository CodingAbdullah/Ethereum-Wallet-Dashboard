import { describe, expect, it } from "vitest";
import { HttpRequestError, encodeAbiParameters, encodeEventTopics, erc20Abi, parseAbi, parseEther, parseGwei, type PublicClient } from "viem";
import { decodeLog, explorerChain, getAddressDetails, getBlockDetails, getTokenDetails, getTxDetails, parseBlockParam } from "./explorer";

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const NFT = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
const ALICE = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const BOB = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const HASH = ('0x' + 'ab'.repeat(32)) as `0x${string}`;

const erc721 = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)']);

const usdcTransfer = {
    address: USDC, logIndex: 3,
    topics: encodeEventTopics({ abi: erc20Abi, eventName: 'Transfer', args: { from: ALICE, to: BOB } }) as `0x${string}`[],
    data: encodeAbiParameters([{ type: 'uint256' }], [BigInt(2_500_000)])
};
const nftTransfer = {
    address: NFT, logIndex: 4,
    topics: encodeEventTopics({ abi: erc721, eventName: 'Transfer', args: { from: BOB, to: ALICE, tokenId: BigInt(42) } }) as `0x${string}`[],
    data: '0x' as const
};
const unknownLog = { address: USDC, logIndex: 5, topics: [('0x' + '11'.repeat(32)) as `0x${string}`], data: '0x' as const };

// A fake RPC client with just enough behaviour for the explorer functions
function fakeClient(overrides: Record<string, unknown> = {}) {
    const tokens: Record<string, Record<string, unknown>> = {
        [USDC.toLowerCase()]: { symbol: 'USDC', decimals: 6, name: 'USD Coin', totalSupply: BigInt(50_000_000_000_000) },
        [NFT.toLowerCase()]: { symbol: 'BAYC', name: 'BoredApeYachtClub' }
    };
    return {
        getTransaction: async () => ({ hash: HASH, blockNumber: BigInt(100), from: ALICE, to: USDC, value: parseEther('0.5'), gas: BigInt(80000), gasPrice: parseGwei('20'), nonce: 7, input: '0xa9059cbb0000' }),
        getTransactionReceipt: async () => ({ status: 'success', gasUsed: BigInt(50000), effectiveGasPrice: parseGwei('10'), contractAddress: null, logs: [usdcTransfer, nftTransfer, unknownLog] }),
        getBlock: async (args?: { blockNumber?: bigint }) => ({
            number: args?.blockNumber ?? BigInt(200), hash: '0xblock', timestamp: BigInt(1_700_000_000), miner: BOB,
            gasUsed: BigInt(15_000_000), gasLimit: BigInt(30_000_000), baseFeePerGas: parseGwei('2'), blobGasUsed: BigInt(262144),
            transactions: [HASH, HASH]
        }),
        getBalance: async () => parseEther('1.25'),
        getBytecode: async ({ address }: { address: string }) => address.toLowerCase() === USDC.toLowerCase() ? '0x60806040' : undefined,
        getTransactionCount: async () => 12,
        readContract: async ({ address, functionName }: { address: string; functionName: string }) => {
            const value = tokens[address.toLowerCase()]?.[functionName];
            if (value === undefined) throw new Error('execution reverted');
            return value;
        },
        ...overrides
    } as unknown as PublicClient;
}

describe("decodeLog", () => {
    it("decodes ERC20 and ERC721 transfers and keeps unknown events as their topic", () => {
        expect(decodeLog(usdcTransfer)).toMatchObject({ event: 'Transfer', from: ALICE, to: BOB, amount: '2500000' });
        expect(decodeLog(nftTransfer)).toMatchObject({ event: 'Transfer', from: BOB, to: ALICE, tokenId: '42' });
        expect(decodeLog(unknownLog).event).toBe('0x' + '11'.repeat(32));
    });
});

describe("getTxDetails", () => {
    it("reads status, fee, method and token transfers with symbols and decimals", async () => {
        const tx = await getTxDetails(fakeClient(), 'eth', HASH);
        expect(tx).toMatchObject({
            status: 'success', blockNumber: 100, timestamp: 1_700_000_000, valueEth: '0.5',
            feeEth: '0.0005', gasPriceGwei: '10', methodId: '0xa9059cbb', nonce: 7
        });
        expect(tx!.logs[0]).toMatchObject({ event: 'Transfer', amount: '2.5', symbol: 'USDC' });
        expect(tx!.logs[1]).toMatchObject({ tokenId: '42', symbol: 'BAYC' });
    });

    it("checksums addresses that the node returns in lowercase", async () => {
        const lower = fakeClient({ getTransaction: async () => ({ hash: HASH, blockNumber: BigInt(100), from: ALICE.toLowerCase(), to: USDC.toLowerCase(), value: BigInt(0), gas: BigInt(21000), gasPrice: parseGwei('1'), nonce: 1, input: '0x' }) });
        expect(await getTxDetails(lower, 'eth', HASH)).toMatchObject({ from: ALICE, to: USDC });
    });

    it("returns null for a bad hash or a transaction that doesn't exist, and marks pending ones", async () => {
        expect(await getTxDetails(fakeClient(), 'eth', '0x1234')).toBeNull();
        const missing = fakeClient({ getTransaction: async () => { throw new Error('Transaction with hash "0x" could not be found.'); } });
        expect(await getTxDetails(missing, 'eth', HASH)).toBeNull();
        const pending = fakeClient({ getTransaction: async () => ({ hash: HASH, blockNumber: null, from: ALICE, to: BOB, value: BigInt(0), gas: BigInt(21000), gasPrice: parseGwei('1'), nonce: 1, input: '0x' }) });
        expect(await getTxDetails(pending, 'eth', HASH)).toMatchObject({ status: 'pending', feeEth: null, methodId: null, logs: [] });
    });

    it("lets RPC outages surface as errors", async () => {
        const down = fakeClient({ getTransaction: async () => { throw new Error('HTTP request failed'); } });
        await expect(getTxDetails(down, 'eth', HASH)).rejects.toThrow('HTTP request failed');
    });
});

describe("getBlockDetails", () => {
    it("computes gas usage and burnt fees", async () => {
        const block = await getBlockDetails(fakeClient(), 'eth', '200');
        expect(block).toMatchObject({ number: 200, txCount: 2, gasUsedPercent: 50, baseFeeGwei: '2', burntEth: '0.03', blobGasUsed: '262144' });
    });

    it("accepts 'latest' and rejects junk", async () => {
        expect(parseBlockParam('latest')).toBe('latest');
        expect(parseBlockParam('12abc')).toBeNull();
        expect(await getBlockDetails(fakeClient(), 'eth', 'nope')).toBeNull();
        expect((await getBlockDetails(fakeClient(), 'eth', 'latest'))!.number).toBe(200);
    });
});

describe("getAddressDetails / getTokenDetails", () => {
    it("tells wallets from contracts and recognises ERC20 tokens", async () => {
        expect(await getAddressDetails(fakeClient(), 'eth', ALICE)).toMatchObject({ balance: '1.25', isContract: false, txCount: 12, token: null, native: 'ETH' });
        expect(await getAddressDetails(fakeClient(), 'polygon', USDC)).toMatchObject({ isContract: true, codeSize: 4, token: { symbol: 'USDC', decimals: 6 }, native: 'POL' });
        expect(await getAddressDetails(fakeClient(), 'eth', 'nope')).toBeNull();
    });

    it("treats an unreachable node as an error, not as 'not a token'", async () => {
        const down = fakeClient({ readContract: async () => { throw new HttpRequestError({ url: 'http://node', details: 'fetch failed' }); } });
        await expect(getTokenDetails(down, 'eth', USDC)).rejects.toThrow();
        await expect(getAddressDetails(down, 'eth', USDC)).rejects.toThrow();
    });

    it("reads token metadata and supply, and returns null for non-tokens", async () => {
        expect(await getTokenDetails(fakeClient(), 'eth', USDC)).toMatchObject({ symbol: 'USDC', name: 'USD Coin', decimals: 6, totalSupply: '50000000' });
        expect(await getTokenDetails(fakeClient(), 'eth', ALICE)).toBeNull();
    });
});

describe("explorerChain", () => {
    it("accepts supported mainnets and falls back to Ethereum", () => {
        expect(explorerChain('base')).toBe('base');
        expect(explorerChain('sepolia')).toBe('eth');
        expect(explorerChain(undefined)).toBe('eth');
        expect(explorerChain(['arbitrum'])).toBe('arbitrum');
    });
});
