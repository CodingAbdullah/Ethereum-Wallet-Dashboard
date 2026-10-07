import { z } from "zod";
import { addressSchema, networkSchema } from "../validation";
import { chainInfo, explorerTx, hasMarketValue } from "../chains";
import { labelFor } from "../labels";
import { SPACES } from "../governance";
import type { AlertData } from "./data";
import { SITE_URL } from "./deliver";

// The alert types. Each one validates its settings, describes itself in plain English, says how often
// n8n should run its check, and turns fresh data plus the subscription's saved state into alerts.

export interface Trigger { dedupeKey: string; title: string; message: string; url?: string }
export interface CheckResult { triggers: Trigger[]; state: Record<string, unknown> }
type State = Record<string, unknown>;

export interface AlertKind<P = Record<string, unknown>> {
    id: string;
    title: string;
    description: string;
    everyMinutes: number;                 // how often the scheduler should run this check (n8n)
    realtime?: boolean;                   // also fed by Moralis Streams webhooks
    params: z.ZodType<P>;
    describe(params: P): string;
    check(params: P, state: State, data: AlertData, now: Date): Promise<CheckResult>;
}

const usd = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: v < 10 ? 4 : 2 });
const pct = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);
const name = (a: string) => labelFor(a)?.name ?? short(a);
const day = (now: Date) => now.toISOString().slice(0, 10);
const none = (state: State): CheckResult => ({ triggers: [], state });

// Fire once when a condition becomes true, then wait until it clearly stops being true before firing again
function threshold(state: State, conditionMet: boolean, cleared: boolean, trigger: () => Trigger): CheckResult {
    const armed = state.armed !== false;
    if (conditionMet && armed) return { triggers: [trigger()], state: { ...state, armed: false } };
    if (!armed && cleared) return { triggers: [], state: { ...state, armed: true } };
    return none(state);
}

// 1. Daily market digest
const marketDigest: AlertKind<Record<string, never>> = {
    id: 'market_digest', title: 'Daily market digest', everyMinutes: 1440,
    description: 'Every morning: ETH price, market cap, gas and the biggest movers.',
    params: z.object({}).strict() as unknown as z.ZodType<Record<string, never>>,
    describe: () => 'Daily recap of ETH, the market and top movers',
    async check(_params, state, data, now) {
        if (state.lastSent === day(now)) return none(state);
        const [eth, global, markets, baseFee] = await Promise.all([data.ethPrice(), data.globalMarket(), data.markets(), data.baseFeeGwei()]);
        const ranked = markets.filter(m => m.price_change_percentage_24h !== null).sort((a, b) => b.price_change_percentage_24h! - a.price_change_percentage_24h!);
        const line = (m: (typeof markets)[number]) => `${m.symbol.toUpperCase()} ${pct(m.price_change_percentage_24h!)}`;
        const message = [
            `ETH ${usd(eth.usd)} (${pct(eth.change24h)} 24h)`,
            `Crypto market cap $${(global.marketCapUsd / 1e12).toFixed(2)}T (${pct(global.change24h)}), ETH dominance ${global.ethDominance.toFixed(1)}%`,
            `Gas: base fee ${baseFee.toFixed(2)} gwei`,
            `Top gainers: ${ranked.slice(0, 3).map(line).join(', ')}`,
            `Top losers: ${ranked.slice(-3).reverse().map(line).join(', ')}`
        ].join('\n');
        return { triggers: [{ dedupeKey: 'digest:' + day(now), title: `Ethereum daily digest · ${day(now)}`, message, url: SITE_URL }], state: { ...state, lastSent: day(now) } };
    }
};

// 2. Watched-wallet activity (real time via Moralis Streams; polling fallback)
const walletParams = z.object({ address: addressSchema, chain: networkSchema, minEth: z.number().min(0).max(1e6).default(0) });
const walletActivity: AlertKind<z.infer<typeof walletParams>> = {
    id: 'wallet_activity', title: 'Wallet activity', everyMinutes: 10, realtime: true,
    description: 'Incoming and outgoing transactions on a wallet, optionally only above a size.',
    params: walletParams,
    describe: p => `Activity on ${name(p.address)} (${chainInfo(p.chain).name})${p.minEth ? `, transfers of ${p.minEth}+ ${chainInfo(p.chain).native}` : ''}`,
    async check(p, state, data) {
        const items = await data.walletActivity(p.address, p.chain);
        const seen = typeof state.lastTimestamp === 'string' ? state.lastTimestamp : null;
        const newest = items[0]?.timestamp ?? seen;
        // First run: remember where we are instead of replaying history
        if (!seen) return none({ ...state, lastTimestamp: newest });
        const fresh = items.filter(i => i.timestamp > seen && i.nativeValue >= p.minEth).reverse();
        const triggers = fresh.map(i => ({
            dedupeKey: 'tx:' + i.hash + ':' + i.category,
            title: `${name(p.address)}: ${i.category}`,
            message: i.summary,
            url: explorerTx(p.chain, i.hash)
        }));
        return { triggers, state: { ...state, lastTimestamp: newest } };
    }
};

// 3. Gas threshold
const gasParams = z.object({ maxGwei: z.number().positive().max(10_000) });
const gasBelow: AlertKind<z.infer<typeof gasParams>> = {
    id: 'gas_below', title: 'Gas below a price', everyMinutes: 5,
    description: 'Tells you when Ethereum gas drops under your price, then waits until it rises again.',
    params: gasParams,
    describe: p => `Base fee at or under ${p.maxGwei} gwei`,
    async check(p, state, data, now) {
        const fee = await data.baseFeeGwei();
        return threshold(state, fee <= p.maxGwei, fee > p.maxGwei * 1.25, () => ({
            dedupeKey: 'gas:' + now.toISOString().slice(0, 16),
            title: `Gas is ${fee.toFixed(2)} gwei`,
            message: `The base fee dropped to ${fee.toFixed(2)} gwei (your limit: ${p.maxGwei}). Good time to send transactions.`,
            url: SITE_URL + '/gas-tracker'
        }));
    }
};

// 4. Price alerts (ETH and any top-250 coin)
const priceParams = z.object({ coin: z.string().regex(/^[a-z0-9-]{1,100}$/), direction: z.enum(['above', 'below']), usd: z.number().positive() });
const price: AlertKind<z.infer<typeof priceParams>> = {
    id: 'price', title: 'Price alert', everyMinutes: 5,
    description: 'ETH or any top-250 coin crossing a price you choose.',
    params: priceParams,
    describe: p => `${p.coin} ${p.direction} ${usd(p.usd)}`,
    async check(p, state, data, now) {
        const current = p.coin === 'ethereum' ? (await data.ethPrice()).usd : (await data.markets()).find(m => m.id === p.coin)?.current_price;
        if (current == null) return none(state);
        const met = p.direction === 'above' ? current >= p.usd : current <= p.usd;
        const cleared = p.direction === 'above' ? current < p.usd * 0.99 : current > p.usd * 1.01;
        return threshold(state, met, cleared, () => ({
            dedupeKey: 'price:' + now.toISOString().slice(0, 16),
            title: `${p.coin} is ${p.direction} ${usd(p.usd)}`,
            message: `${p.coin} is now ${usd(current)}.`,
            url: `${SITE_URL}/prices/${p.coin}`
        }));
    }
};

// 5. Validator health (Beacon API)
const validatorParams = z.object({ validator: z.string().regex(/^(\d{1,9}|0x[0-9a-fA-F]{96})$/, 'Validator index or public key') });
const validator: AlertKind<z.infer<typeof validatorParams>> = {
    id: 'validator', title: 'Validator alerts', everyMinutes: 15,
    description: 'Slashing, exits, and balance drops (a sign of missed attestations) for your validator.',
    params: validatorParams,
    describe: p => `Validator ${p.validator.length > 12 ? short(p.validator) : p.validator}`,
    async check(p, state, data, now) {
        const v = (await data.validators([p.validator])).find(x => x.index === p.validator || p.validator.startsWith('0x'));
        if (!v) return none(state);
        const triggers: Trigger[] = [];
        const label = `Validator ${v.index}`;
        const url = `https://beaconcha.in/validator/${v.index}`;
        if (v.slashed && !state.slashed) triggers.push({ dedupeKey: 'slashed', title: `${label} was slashed`, message: 'This validator has been slashed and is being removed from the validator set.', url });
        if (typeof state.status === 'string' && state.status !== v.status) {
            triggers.push({ dedupeKey: 'status:' + v.status, title: `${label}: ${v.status.replace(/_/g, ' ')}`, message: `Status changed from ${state.status.replace(/_/g, ' ')} to ${v.status.replace(/_/g, ' ')}.`, url });
        }
        const last = typeof state.balanceGwei === 'number' ? state.balanceGwei : null;
        // Balances rise with rewards and fall when duties are missed; withdrawals of rewards above 32 ETH are skipped
        if (last !== null && v.balanceGwei < last && last - v.balanceGwei < 1e9 && v.status.startsWith('active')) {
            triggers.push({ dedupeKey: 'drop:' + now.toISOString().slice(0, 15), title: `${label} lost balance`, message: `Balance fell by ${((last - v.balanceGwei) / 1e9).toFixed(6)} ETH since the last check, which usually means missed attestations. Check that your node is online.`, url });
        }
        return { triggers, state: { ...state, status: v.status, balanceGwei: v.balanceGwei, slashed: v.slashed } };
    }
};

// 6. New risky token approval on a watched wallet (real time via Moralis Streams; polling fallback)
const approvalParams = z.object({ address: addressSchema, chain: networkSchema });
const riskyApproval: AlertKind<z.infer<typeof approvalParams>> = {
    id: 'risky_approval', title: 'Risky token approvals', everyMinutes: 30, realtime: true,
    description: 'A new unlimited approval, or one to an unknown contract, on your wallet.',
    params: approvalParams,
    describe: p => `New risky approvals on ${name(p.address)} (${chainInfo(p.chain).name})`,
    async check(p, state, data) {
        if (!hasMarketValue(p.chain)) return none(state);
        const approvals = await data.approvals(p.address, p.chain);
        const keys = approvals.map(a => a.tokenAddress + ':' + a.spender.toLowerCase());
        const known = Array.isArray(state.known) ? new Set(state.known as string[]) : null;
        if (!known) return none({ ...state, known: keys });             // first run: baseline
        const triggers = approvals.filter((a, i) => !known.has(keys[i]) && (a.unlimited || !a.spenderLabel)).map(a => ({
            dedupeKey: 'approval:' + a.tokenAddress + ':' + a.spender.toLowerCase(),
            title: `New ${a.unlimited ? 'unlimited ' : ''}approval on ${name(p.address)}`,
            message: `${a.spenderLabel ?? short(a.spender)} can now spend ${a.unlimited ? 'all of your' : a.amount} ${a.tokenSymbol}. If you didn't do this, revoke it.`,
            url: `${SITE_URL}/address/${p.address}`
        }));
        return { triggers, state: { ...state, known: keys } };
    }
};

// 7. NFT floor price moves (OpenSea)
const floorParams = z.object({ collection: z.string().regex(/^[a-z0-9-]{1,100}$/, 'OpenSea collection slug'), movePercent: z.number().min(1).max(500).default(10) });
const nftFloor: AlertKind<z.infer<typeof floorParams>> = {
    id: 'nft_floor', title: 'NFT floor moves', everyMinutes: 30,
    description: 'A collection\'s floor price moving more than a percentage you set.',
    params: floorParams,
    describe: p => `${p.collection} floor moves ${p.movePercent}%+`,
    async check(p, state, data, now) {
        const { floor, symbol } = await data.nftFloor(p.collection);
        const base = typeof state.baseline === 'number' ? state.baseline : null;
        if (!base || floor <= 0) return none({ ...state, baseline: floor > 0 ? floor : base });
        const change = (floor - base) / base * 100;
        if (Math.abs(change) < p.movePercent) return none(state);
        return {
            triggers: [{ dedupeKey: 'floor:' + now.toISOString().slice(0, 16), title: `${p.collection} floor ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}%`, message: `Floor is ${floor} ${symbol}, from ${base} ${symbol}.`, url: `https://opensea.io/collection/${p.collection}` }],
            state: { ...state, baseline: floor }
        };
    }
};

// 8. ENS expiry reminders (30, 7 and 1 day before)
const ensParams = z.object({ address: addressSchema });
const REMINDER_DAYS = [30, 7, 1];
const ensExpiry: AlertKind<z.infer<typeof ensParams>> = {
    id: 'ens_expiry', title: 'ENS expiry reminders', everyMinutes: 1440,
    description: 'Reminders 30, 7 and 1 day before a .eth name owned by your wallet expires.',
    params: ensParams,
    describe: p => `.eth names owned by ${name(p.address)}`,
    async check(p, state, data, now) {
        const names = await data.ensNames(p.address);
        const triggers: Trigger[] = [];
        for (const n of names) {
            if (!n.expires) continue;
            const daysLeft = Math.ceil((new Date(n.expires).getTime() - now.getTime()) / 86_400_000);
            const due = REMINDER_DAYS.filter(d => daysLeft <= d && daysLeft > 0).sort((a, b) => a - b)[0];
            if (due) triggers.push({
                dedupeKey: `ens:${n.name}:${n.expires.slice(0, 10)}:${due}`,
                title: `${n.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
                message: `${n.name} expires on ${n.expires.slice(0, 10)}. Renew it before then to keep it (there's a 90-day grace period after).`,
                url: `https://app.ens.domains/${n.name}`
            });
        }
        return { triggers, state };
    }
};

// 9. Depeg alerts (stETH vs ETH, and major stablecoins vs $1)
const DEPEG_ASSETS = { steth: 'staked-ether', usdt: 'tether', usdc: 'usd-coin', dai: 'dai' } as const;
const depegParams = z.object({ asset: z.enum(['steth', 'usdt', 'usdc', 'dai']), thresholdPercent: z.number().min(0.1).max(50).default(1) });
const depeg: AlertKind<z.infer<typeof depegParams>> = {
    id: 'depeg', title: 'Depeg alerts', everyMinutes: 10,
    description: 'stETH trading away from ETH, or USDT/USDC/DAI away from $1.',
    params: depegParams,
    describe: p => `${p.asset.toUpperCase()} off its peg by ${p.thresholdPercent}%+`,
    async check(p, state, data, now) {
        const markets = await data.markets();
        const asset = markets.find(m => m.id === DEPEG_ASSETS[p.asset])?.current_price;
        const peg = p.asset === 'steth' ? markets.find(m => m.id === 'ethereum')?.current_price : 1;
        if (asset == null || !peg) return none(state);
        const deviation = (asset / peg - 1) * 100;
        const unit = p.asset === 'steth' ? 'ETH' : '$1';
        return threshold(state, Math.abs(deviation) >= p.thresholdPercent, Math.abs(deviation) < p.thresholdPercent / 2, () => ({
            dedupeKey: 'depeg:' + now.toISOString().slice(0, 16),
            title: `${p.asset.toUpperCase()} is ${Math.abs(deviation).toFixed(2)}% ${deviation < 0 ? 'below' : 'above'} its peg`,
            message: `${p.asset.toUpperCase()} trades at ${p.asset === 'steth' ? (asset / peg).toFixed(4) + ' ETH' : usd(asset)} against ${unit}.`,
            url: SITE_URL + '/prices/' + DEPEG_ASSETS[p.asset]
        }));
    }
};

// 10. New governance proposals (Snapshot)
const governanceParams = z.object({ spaces: z.array(z.string().regex(/^[a-z0-9.-]{3,80}$/)).min(1).max(20) });
const governance: AlertKind<z.infer<typeof governanceParams>> = {
    id: 'governance', title: 'New governance proposals', everyMinutes: 30,
    description: 'New Snapshot votes for the DAOs you pick.',
    params: governanceParams,
    describe: p => `New proposals in ${p.spaces.length === 1 ? p.spaces[0] : p.spaces.length + ' DAOs'}`,
    async check(p, state, data, now) {
        const since = typeof state.since === 'number' ? state.since : Math.floor(now.getTime() / 1000);
        if (typeof state.since !== 'number') return none({ ...state, since });
        const proposals = (await data.newProposals(p.spaces, since)).filter(x => p.spaces.includes(x.space));
        const newest = proposals.reduce((m, x) => Math.max(m, x.created), since);
        return {
            triggers: proposals.map(x => ({
                dedupeKey: 'proposal:' + x.id,
                title: `New ${x.spaceName} proposal`,
                message: `${x.title}\nVoting ends ${new Date(x.end * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
                url: x.link
            })),
            state: { ...state, since: newest }
        };
    }
};

export const ALERT_KINDS = [marketDigest, walletActivity, gasBelow, price, validator, riskyApproval, nftFloor, ensExpiry, depeg, governance] as AlertKind<Record<string, unknown>>[];
export const alertKind = (id: string) => ALERT_KINDS.find(k => k.id === id);
export const SUGGESTED_SPACES = SPACES;
