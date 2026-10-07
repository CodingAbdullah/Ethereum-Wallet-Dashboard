import { formatUnits, isAddressEqual } from "viem";
import { chainByChainId, chainInfo, explorerTx } from "../chains";
import { labelFor } from "../labels";
import { SITE_URL } from "./deliver";
import type { Trigger } from "./kinds";

// Moralis Streams (real-time wallet activity and approvals).
// One stream (MORALIS_STREAM_ID) watches every address with a wallet_activity or risky_approval alert;
// addresses are added and removed as alerts are created and deleted. Moralis POSTs each transaction
// to /api/webhooks/moralis, once unconfirmed and again confirmed (the dedupe key catches the repeat).

export const REALTIME_KINDS = ['wallet_activity', 'risky_approval'];
const STREAMS_URL = 'https://api.moralis-streams.com/streams/evm/';

type Env = Record<string, string | undefined>;
type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? v as Json : {});
const list = (v: unknown): Json[] => (Array.isArray(v) ? v.map(obj) : []);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const same = (a: string, b: string) => { try { return isAddressEqual(a as `0x${string}`, b as `0x${string}`); } catch { return false; } };
const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);
const who = (a: string) => labelFor(a)?.name ?? short(a);
const bigint = (v: unknown): bigint => { try { return BigInt(str(v) || '0'); } catch { return BigInt(0); } };
const amount = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: v < 1 ? 6 : 4 });

// Same rule as the approvals table: (close to) max uint256 counts as unlimited
const UNLIMITED = BigInt(10) ** BigInt(69);

export interface StreamSubscription { kind: string; params: Record<string, unknown> }

export interface StreamPayload { chain: string | null; confirmed: boolean; txs: Json[]; erc20Transfers: Json[]; erc20Approvals: Json[] }

export function parseStreamPayload(body: unknown): StreamPayload {
    const b = obj(body);
    const chainId = parseInt(str(b.chainId), 16);
    return {
        chain: chainByChainId(chainId)?.key ?? null,
        confirmed: b.confirmed === true,
        txs: list(b.txs),
        erc20Transfers: list(b.erc20Transfers).filter(t => t.possibleSpam !== true),
        erc20Approvals: list(b.erc20Approvals)
    };
}

// Turns one webhook delivery into the alerts one subscription should receive
export function streamTriggers(payload: StreamPayload, sub: StreamSubscription): Trigger[] {
    const address = str(sub.params.address);
    if (!payload.chain || payload.chain !== sub.params.chain || !address) return [];
    const chain = chainInfo(payload.chain);

    if (sub.kind === 'wallet_activity') {
        const minEth = Number(sub.params.minEth ?? 0);
        const byHash = new Map<string, { lines: string[]; native: number; direction: Set<string> }>();
        const entry = (hash: string) => {
            if (!byHash.has(hash)) byHash.set(hash, { lines: [], native: 0, direction: new Set() });
            return byHash.get(hash)!;
        };
        for (const tx of payload.txs) {
            const from = str(tx.fromAddress), to = str(tx.toAddress), hash = str(tx.hash).toLowerCase();
            if (!hash || !(same(from, address) || same(to, address))) continue;
            const value = Number(formatUnits(bigint(tx.value), 18));
            const e = entry(hash);
            e.native += value;
            if (same(from, address)) {
                e.direction.add('sent');
                e.lines.push(value > 0 ? `Sent ${amount(value)} ${chain.native} to ${who(to)}` : `Called ${who(to)}`);
            }
            else {
                e.direction.add('received');
                e.lines.push(`Received ${amount(value)} ${chain.native} from ${who(from)}`);
            }
        }
        for (const t of payload.erc20Transfers) {
            const from = str(t.from), to = str(t.to), hash = str(t.transactionHash).toLowerCase();
            if (!hash || !(same(from, address) || same(to, address))) continue;
            const symbol = str(t.tokenSymbol) || 'tokens';
            const value = str(t.valueWithDecimals) || formatUnits(bigint(t.value), Number(t.tokenDecimals ?? 18));
            const e = entry(hash);
            if (same(from, address)) { e.direction.add('sent'); e.lines.push(`Sent ${amount(Number(value))} ${symbol} to ${who(to)}`); }
            else { e.direction.add('received'); e.lines.push(`Received ${amount(Number(value))} ${symbol} from ${who(from)}`); }
        }
        return [...byHash.entries()]
            .filter(([, e]) => e.native >= minEth && (minEth === 0 || e.native > 0))
            .map(([hash, e]) => ({
                dedupeKey: 'tx:' + hash,
                title: `${who(address)}: ${e.direction.size === 1 ? [...e.direction][0] : 'sent and received'}${payload.confirmed ? '' : ' (pending confirmation)'}`,
                message: e.lines.slice(0, 10).join('\n'),
                url: explorerTx(payload.chain!, hash)
            }));
    }

    if (sub.kind === 'risky_approval') {
        return payload.erc20Approvals
            .filter(a => same(str(a.owner), address) && bigint(a.value) > BigInt(0))
            .map(a => ({ approval: a, spender: str(a.spender), unlimited: bigint(a.value) >= UNLIMITED }))
            .filter(a => a.unlimited || !labelFor(a.spender))
            .map(({ approval, spender, unlimited }) => {
                const symbol = str(approval.tokenSymbol) || 'tokens';
                const spenderName = labelFor(spender)?.name ?? short(spender);
                return {
                    dedupeKey: 'approval:' + str(approval.transactionHash).toLowerCase() + ':' + str(approval.contract).toLowerCase() + ':' + spender.toLowerCase(),
                    title: `New ${unlimited ? 'unlimited ' : ''}approval on ${who(address)}`,
                    message: `${spenderName} can now spend ${unlimited ? 'all of your' : amount(Number(str(approval.valueWithDecimals) || 0))} ${symbol}. If you didn't do this, revoke it.`,
                    url: `${SITE_URL}/address/${address}`
                };
            });
    }
    return [];
}

async function streamAddresses(method: 'POST' | 'DELETE', addresses: string[], env: Env, fetcher: typeof fetch) {
    if (!env.MORALIS_STREAM_ID || !env.MORALIS_API_KEY || addresses.length === 0) return;
    const response = await fetcher(STREAMS_URL + encodeURIComponent(env.MORALIS_STREAM_ID) + '/address', {
        method,
        headers: { 'content-type': 'application/json', 'x-api-key': env.MORALIS_API_KEY },
        body: JSON.stringify({ address: addresses }),
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`Moralis Streams responded with ${response.status}`);
}

// Start / stop watching addresses on the stream (no-ops when Streams isn't configured)
export const watchAddresses = (addresses: string[], env: Env = process.env, fetcher: typeof fetch = fetch) => streamAddresses('POST', addresses, env, fetcher);
export const unwatchAddresses = (addresses: string[], env: Env = process.env, fetcher: typeof fetch = fetch) => streamAddresses('DELETE', addresses, env, fetcher);
