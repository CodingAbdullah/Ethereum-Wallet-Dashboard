import { describe, expect, it } from "vitest";
import { alertKind, ALERT_KINDS } from "./kinds";
import { memoize, type AlertData } from "./data";
import type { CoinMarket } from "../providers/coingecko";
import type { ActivityItem, TokenApproval } from "../walletInsights";

const NOW = new Date('2026-10-07T08:00:00Z');
const WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const market = (id: string, price: number, change = 0): CoinMarket => ({
    id, symbol: id.slice(0, 4), name: id, image: '', current_price: price, market_cap: 1, market_cap_rank: 1, total_volume: 1, price_change_percentage_24h: change
});

function fakeData(overrides: Partial<AlertData> = {}): AlertData {
    const fail = () => Promise.reject(new Error('not stubbed'));
    return {
        ethPrice: async () => ({ usd: 2500, change24h: 1.5 }),
        markets: async () => [market('ethereum', 2500, 1.5), market('bitcoin', 60000, -2), market('staked-ether', 2500), market('tether', 1), market('usd-coin', 1), market('dai', 1), market('pepe', 0.00001, 20)],
        globalMarket: async () => ({ marketCapUsd: 2.4e12, change24h: 0.8, ethDominance: 13.2 }),
        baseFeeGwei: async () => 12,
        walletActivity: fail, approvals: fail, validators: fail, nftFloor: fail, ensNames: fail, newProposals: fail,
        ...overrides
    };
}

async function run(id: string, params: unknown, state: Record<string, unknown>, data: AlertData, now = NOW) {
    const kind = alertKind(id)!;
    return kind.check(kind.params.parse(params), state, data, now);
}

describe("alert kinds", () => {
    it("all have unique ids, a schedule and a description", () => {
        expect(new Set(ALERT_KINDS.map(k => k.id)).size).toBe(ALERT_KINDS.length);
        for (const k of ALERT_KINDS) {
            expect(k.everyMinutes).toBeGreaterThan(0);
            expect(k.title && k.description).toBeTruthy();
        }
    });

    it("market_digest sends once a day", async () => {
        const first = await run('market_digest', {}, {}, fakeData());
        expect(first.triggers).toHaveLength(1);
        expect(first.triggers[0].message).toContain('ETH $2,500');
        expect(first.triggers[0].message).toContain('Top gainers: PEPE +20.00%');
        const again = await run('market_digest', {}, first.state, fakeData());
        expect(again.triggers).toHaveLength(0);
        const tomorrow = await run('market_digest', {}, first.state, fakeData(), new Date('2026-10-08T08:00:00Z'));
        expect(tomorrow.triggers).toHaveLength(1);
    });

    it("wallet_activity baselines first, then reports new transactions above minEth", async () => {
        const item = (hash: string, timestamp: string, nativeValue: number): ActivityItem => ({ hash, timestamp, category: 'send', summary: 'Sent ' + nativeValue + ' ETH', possibleSpam: false, nativeValue });
        let items = [item('0x1', '2026-10-07T07:00:00.000Z', 5)];
        const data = fakeData({ walletActivity: async () => items });
        const params = { address: WALLET, chain: 'eth', minEth: 1 };

        const first = await run('wallet_activity', params, {}, data);
        expect(first.triggers).toHaveLength(0);
        expect(first.state.lastTimestamp).toBe('2026-10-07T07:00:00.000Z');

        items = [item('0x3', '2026-10-07T07:20:00.000Z', 2), item('0x2', '2026-10-07T07:10:00.000Z', 0.1), ...items];
        const second = await run('wallet_activity', params, first.state, data);
        expect(second.triggers.map(t => t.dedupeKey)).toEqual(['tx:0x3:send']);
        expect(second.triggers[0].url).toBe('https://etherscan.io/tx/0x3');
        expect(second.state.lastTimestamp).toBe('2026-10-07T07:20:00.000Z');
    });

    it("gas_below fires once and re-arms only when gas clearly rises", async () => {
        let fee = 8;
        const data = fakeData({ baseFeeGwei: async () => fee });
        const a = await run('gas_below', { maxGwei: 10 }, {}, data);
        expect(a.triggers).toHaveLength(1);
        const b = await run('gas_below', { maxGwei: 10 }, a.state, data);
        expect(b.triggers).toHaveLength(0);
        fee = 11;                                       // above the limit but not 25% above: still disarmed
        const c = await run('gas_below', { maxGwei: 10 }, b.state, data);
        expect(c.state.armed).toBe(false);
        fee = 13;
        const d = await run('gas_below', { maxGwei: 10 }, c.state, data);
        expect(d.state.armed).toBe(true);
        fee = 9;
        expect((await run('gas_below', { maxGwei: 10 }, d.state, data)).triggers).toHaveLength(1);
    });

    it("price works for ETH and other top coins, both directions", async () => {
        const eth = await run('price', { coin: 'ethereum', direction: 'above', usd: 2400 }, {}, fakeData());
        expect(eth.triggers[0].title).toBe('ethereum is above $2,400');
        const btc = await run('price', { coin: 'bitcoin', direction: 'below', usd: 50000 }, {}, fakeData());
        expect(btc.triggers).toHaveLength(0);
        const unknown = await run('price', { coin: 'not-a-coin', direction: 'below', usd: 1 }, {}, fakeData());
        expect(unknown.triggers).toHaveLength(0);
        expect(() => alertKind('price')!.params.parse({ coin: 'ETH!', direction: 'above', usd: 1 })).toThrow();
    });

    it("validator reports slashing, status changes and balance drops", async () => {
        let v = { index: '123', status: 'active_ongoing', balanceGwei: 32_010_000_000, slashed: false };
        const data = fakeData({ validators: async () => [v] });
        const first = await run('validator', { validator: '123' }, {}, data);
        expect(first.triggers).toHaveLength(0);

        v = { ...v, balanceGwei: 32_009_000_000 };
        const drop = await run('validator', { validator: '123' }, first.state, data);
        expect(drop.triggers.map(t => t.title)).toEqual(['Validator 123 lost balance']);

        v = { ...v, status: 'active_slashed', slashed: true };
        const slashed = await run('validator', { validator: '123' }, drop.state, data);
        expect(slashed.triggers.map(t => t.dedupeKey)).toEqual(['slashed', 'status:active_slashed']);
        expect((await run('validator', { validator: '123' }, slashed.state, data)).triggers).toHaveLength(0);
    });

    it("risky_approval baselines, then flags new unlimited or unknown spenders", async () => {
        const approval = (spender: string, unlimited: boolean, spenderLabel: string | null): TokenApproval => ({
            tokenAddress: '0xa0b8', tokenSymbol: 'USDC', tokenName: 'USD Coin', tokenLogo: null, spender, spenderLabel,
            amount: unlimited ? 'Unlimited' : '10', unlimited, usdAtRisk: null, approvedAt: null, transactionHash: null
        });
        let approvals = [approval('0xAAA', true, 'Uniswap')];
        const data = fakeData({ approvals: async () => approvals });
        const params = { address: WALLET, chain: 'eth' };
        const first = await run('risky_approval', params, {}, data);
        expect(first.triggers).toHaveLength(0);

        approvals = [...approvals, approval('0xBBB', false, 'Uniswap'), approval('0xCCC', false, null)];
        const second = await run('risky_approval', params, first.state, data);
        expect(second.triggers.map(t => t.dedupeKey)).toEqual(['approval:0xa0b8:0xccc']);

        expect((await run('risky_approval', { address: WALLET, chain: 'sepolia' }, {}, data)).state).toEqual({});
    });

    it("nft_floor fires on a big move and resets the baseline", async () => {
        let floor = 10;
        const data = fakeData({ nftFloor: async () => ({ floor, symbol: 'ETH' }) });
        const first = await run('nft_floor', { collection: 'pudgypenguins' }, {}, data);
        expect(first.state.baseline).toBe(10);
        floor = 10.5;
        expect((await run('nft_floor', { collection: 'pudgypenguins' }, first.state, data)).triggers).toHaveLength(0);
        floor = 8;
        const moved = await run('nft_floor', { collection: 'pudgypenguins' }, first.state, data);
        expect(moved.triggers[0].title).toBe('pudgypenguins floor down 20.0%');
        expect(moved.state.baseline).toBe(8);
    });

    it("ens_expiry reminds at the nearest due point", async () => {
        const data = fakeData({ ensNames: async () => [
            { name: 'soon.eth', expires: '2026-10-12T00:00:00Z' },
            { name: 'later.eth', expires: '2027-06-01T00:00:00Z' },
            { name: 'gone.eth', expires: '2026-09-01T00:00:00Z' },
            { name: 'wrapped.eth', expires: null }
        ] });
        const result = await run('ens_expiry', { address: WALLET }, {}, data);
        expect(result.triggers.map(t => t.dedupeKey)).toEqual(['ens:soon.eth:2026-10-12:7']);
    });

    it("depeg compares stETH to ETH and stablecoins to $1", async () => {
        const data = fakeData({ markets: async () => [market('ethereum', 2500), market('staked-ether', 2450), market('tether', 0.999)] });
        const steth = await run('depeg', { asset: 'steth' }, {}, data);
        expect(steth.triggers[0].title).toBe('STETH is 2.00% below its peg');
        expect((await run('depeg', { asset: 'usdt' }, {}, data)).triggers).toHaveLength(0);
        expect((await run('depeg', { asset: 'usdc' }, {}, data)).triggers).toHaveLength(0);   // missing price: no alert
    });

    it("governance baselines, then reports proposals in the chosen spaces", async () => {
        const data = fakeData({ newProposals: async (_spaces, since) => [
            { id: '0xp1', space: 'aave.eth', spaceName: 'Aave', title: 'Raise caps', created: since + 10, end: since + 86400, link: 'https://snapshot.box/#/s:aave.eth/proposal/0xp1' },
            { id: '0xp2', space: 'other.eth', spaceName: 'Other', title: 'Not mine', created: since + 20, end: since + 86400, link: 'https://snapshot.box/' }
        ] });
        const first = await run('governance', { spaces: ['aave.eth'] }, {}, data);
        expect(first.triggers).toHaveLength(0);
        const second = await run('governance', { spaces: ['aave.eth'] }, first.state, data);
        expect(second.triggers.map(t => t.title)).toEqual(['New Aave proposal']);
        expect(second.state.since).toBe((first.state.since as number) + 10);
    });
});

describe("memoize", () => {
    it("fetches each value once per run", async () => {
        let calls = 0;
        const data = memoize(fakeData({ baseFeeGwei: async () => { calls++; return 5; } }));
        await Promise.all([data.baseFeeGwei(), data.baseFeeGwei(), data.baseFeeGwei()]);
        expect(calls).toBe(1);
    });
});
