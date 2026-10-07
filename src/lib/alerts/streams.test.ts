import { describe, expect, it } from "vitest";
import { parseStreamPayload, streamTriggers, unwatchAddresses, watchAddresses } from "./streams";

const WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const OTHER = '0x1111111111111111111111111111111111111111';
const MAX = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const payload = (extra: Record<string, unknown>) => parseStreamPayload({ chainId: '0x1', confirmed: false, txs: [], erc20Transfers: [], erc20Approvals: [], ...extra });
const activity = (params: Record<string, unknown> = {}) => ({ kind: 'wallet_activity', params: { address: WALLET, chain: 'eth', minEth: 0, ...params } });

describe("streamTriggers", () => {
    it("ignores the empty test delivery and unknown chains", () => {
        expect(parseStreamPayload({ chainId: '', txs: [] }).chain).toBeNull();
        expect(streamTriggers(payload({}), activity())).toEqual([]);
    });

    it("reports native and token transfers, one alert per transaction", () => {
        const p = payload({
            txs: [{ hash: '0xAB', fromAddress: OTHER.toLowerCase(), toAddress: WALLET.toLowerCase(), value: '1500000000000000000' }],
            erc20Transfers: [
                { transactionHash: '0xab', from: OTHER, to: WALLET.toLowerCase(), tokenSymbol: 'USDC', valueWithDecimals: '250' },
                { transactionHash: '0xcd', from: OTHER, to: WALLET, tokenSymbol: 'SCAM', valueWithDecimals: '1', possibleSpam: true }
            ]
        });
        const triggers = streamTriggers(p, activity());
        expect(triggers).toHaveLength(1);
        expect(triggers[0]).toMatchObject({ dedupeKey: 'tx:0xab', url: 'https://etherscan.io/tx/0xab' });
        expect(triggers[0].title).toContain('received (pending confirmation)');
        expect(triggers[0].message).toBe('Received 1.5 ETH from 0x1111…1111\nReceived 250 USDC from 0x1111…1111');
    });

    it("applies minEth and the subscription's chain", () => {
        const p = payload({ txs: [{ hash: '0x1', fromAddress: WALLET, toAddress: OTHER, value: '100000000000000000' }], erc20Transfers: [{ transactionHash: '0x2', from: WALLET, to: OTHER, tokenSymbol: 'USDC', valueWithDecimals: '5' }] });
        expect(streamTriggers(p, activity()).map(t => t.dedupeKey)).toEqual(['tx:0x1', 'tx:0x2']);
        expect(streamTriggers(p, activity({ minEth: 0.05 })).map(t => t.dedupeKey)).toEqual(['tx:0x1']);
        expect(streamTriggers(p, activity({ minEth: 1 }))).toEqual([]);
        expect(streamTriggers(p, activity({ chain: 'base' }))).toEqual([]);
    });

    it("flags unlimited or unknown-spender approvals, not revokes", () => {
        const approval = (spender: string, value: string) => ({ transactionHash: '0xa1', contract: '0xToken', owner: WALLET.toLowerCase(), spender, value, tokenSymbol: 'USDC', valueWithDecimals: '10' });
        const p = payload({ erc20Approvals: [approval(OTHER, MAX), approval('0x2222222222222222222222222222222222222222', '10000000'), approval(OTHER, '0')] });
        const triggers = streamTriggers(p, { kind: 'risky_approval', params: { address: WALLET, chain: 'eth' } });
        expect(triggers.map(t => t.title)).toEqual(['New unlimited approval on vitalik.eth', 'New approval on vitalik.eth']);
        expect(triggers[0].message).toContain('all of your USDC');
        expect(triggers[1].message).toContain('can now spend 10 USDC');
    });
});

describe("watchAddresses", () => {
    it("adds and removes stream addresses, or does nothing when Streams isn't configured", async () => {
        const calls: { url: string; method?: string; body?: unknown }[] = [];
        const fetcher = (async (url: string, init: RequestInit) => { calls.push({ url, method: init.method, body: init.body }); return new Response('{}'); }) as unknown as typeof fetch;
        await watchAddresses([WALLET], {}, fetcher);
        expect(calls).toHaveLength(0);
        const env = { MORALIS_STREAM_ID: 'abc', MORALIS_API_KEY: 'key' };
        await watchAddresses([WALLET], env, fetcher);
        await unwatchAddresses([WALLET], env, fetcher);
        expect(calls).toEqual([
            { url: 'https://api.moralis-streams.com/streams/evm/abc/address', method: 'POST', body: JSON.stringify({ address: [WALLET] }) },
            { url: 'https://api.moralis-streams.com/streams/evm/abc/address', method: 'DELETE', body: JSON.stringify({ address: [WALLET] }) }
        ]);
    });
});
