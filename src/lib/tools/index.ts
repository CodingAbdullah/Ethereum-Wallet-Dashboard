import { z } from "zod";
import { getAddress, isAddress, isHash } from "viem";
import { chainInfo, CHAINS, hasMarketValue } from "../chains";
import { networkSchema, type Network } from "../validation";
import { lookupEnsName, resolveEnsName } from "../ens";
import { getWalletTokens } from "../portfolio";
import { getActivity, getApprovals, getDefiPositions } from "../walletInsights";
import { moralis } from "../providers/moralis";
import { ProviderError } from "../providers/http";
import { coingecko, getTopMarkets, CG_CACHE } from "../providers/coingecko";
import { getCollectionSlug, getCollectionStats } from "../providers/opensea";
import { getGasEstimate } from "../gas";
import { getValidatorQueue } from "../validators";
import { getStakingOverview } from "../stakingOverview";
import { getDefiOverview } from "../defi";
import { getL2Overview } from "../l2";
import { getDerivatives } from "../derivatives";
import { getGovernance } from "../governance";
import { getEthSupply } from "../ethSupply";
import { getTokenRisks } from "../tokenRisk";
import { cachedAddress, cachedTx } from "../explorerCache";
import { EXPLORER_CHAINS, type ExplorerChain } from "../explorer";
import { labelFor } from "../labels";

// The dashboard's tools, shared by the MCP server (/api/mcp) and the in-app agent (/api/agent).
// Every tool only reads data: none of them can sign, send or change anything.
// Results are trimmed to what a model needs, so answers stay inside the context window and free-plan quotas.

export class ToolError extends Error {}

export interface DashboardTool<I extends z.ZodType = z.ZodType> {
    name: string;
    title: string;
    description: string;
    input: I;
    run(input: z.infer<I>): Promise<unknown>;
}

const tool = <I extends z.ZodType>(t: DashboardTool<I>) => t as unknown as DashboardTool;

const wallet = z.string().trim().min(3).max(100).describe('Wallet address (0x...) or ENS name (e.g. vitalik.eth)');
const chain = networkSchema.describe('Network: ' + Object.keys(CHAINS).join(', ') + '. Defaults to eth (Ethereum mainnet).');
const explorerChain = z.enum(EXPLORER_CHAINS as [ExplorerChain, ...ExplorerChain[]]).default('eth').describe('Network: ' + EXPLORER_CHAINS.join(', '));
const noInput = z.object({});

const round = (n: number | null | undefined, digits = 2) => n == null ? null : Number(n.toFixed(digits));

// Accepts an address or an ENS name
export async function resolveWallet(input: string): Promise<string> {
    const value = input.trim();
    if (isAddress(value, { strict: false })) return getAddress(value);
    if (!/^[^\s]+\.[a-z]{2,}$/i.test(value)) throw new ToolError(`"${value}" is not an address or ENS name`);
    const resolved = await resolveEnsName(value);
    if (!resolved) throw new ToolError(`${value} does not resolve to an address`);
    return resolved;
}

function requireMarketValue(network: Network) {
    if (!hasMarketValue(network)) throw new ToolError(`${chainInfo(network).name} is a testnet; this data only exists on mainnets`);
}

export const TOOLS: DashboardTool[] = [
    tool({
        name: 'get_wallet_portfolio',
        title: 'Wallet portfolio',
        description: 'Token holdings of a wallet on one network, with USD values and 24h changes (spam tokens excluded).',
        input: z.object({ address: wallet, chain }),
        async run({ address, chain }) {
            const resolved = await resolveWallet(address);
            const tokens = await getWalletTokens(resolved, chain);
            const sorted = [...tokens].sort((a, b) => b.usdValue - a.usdValue);
            return {
                address: resolved, chain: chainInfo(chain).name,
                totalUsd: round(sorted.reduce((s, t) => s + t.usdValue, 0)),
                tokenCount: sorted.length,
                tokens: sorted.slice(0, 25).map(t => ({ symbol: t.symbol, name: t.name, balance: round(t.balance, 6), usdPrice: t.usdPrice, usdValue: round(t.usdValue), change24hPercent: round(t.change24h), contract: t.native ? null : t.tokenAddress }))
            };
        }
    }),
    tool({
        name: 'get_wallet_pnl',
        title: 'Wallet profit and loss',
        description: 'Realized profit and loss summary for a wallet on Ethereum mainnet (trades, volume, realized PnL).',
        input: z.object({ address: wallet }),
        async run({ address }) {
            const resolved = await resolveWallet(address);
            return { address: resolved, ...(await moralis<Record<string, unknown>>('/wallets/' + resolved + '/profitability/summary', 600)) };
        }
    }),
    tool({
        name: 'get_wallet_activity',
        title: 'Wallet activity',
        description: 'Recent transactions of a wallet in plain English (sends, receives, swaps, approvals...), newest first.',
        input: z.object({ address: wallet, chain, limit: z.number().int().min(1).max(25).default(15) }),
        async run({ address, chain, limit }) {
            const resolved = await resolveWallet(address);
            const items = await getActivity(resolved, chain, limit);
            return { address: resolved, chain: chainInfo(chain).name, items: items.map(i => ({ time: i.timestamp, category: i.category, summary: i.summary, hash: i.hash })) };
        }
    }),
    tool({
        name: 'get_token_approvals',
        title: 'Token approvals',
        description: 'ERC20 spending approvals a wallet has granted, with USD at risk and whether the spender is unlimited or unknown.',
        input: z.object({ address: wallet, chain }),
        async run({ address, chain }) {
            requireMarketValue(chain);
            const resolved = await resolveWallet(address);
            const approvals = await getApprovals(resolved, chain);
            return {
                address: resolved, chain: chainInfo(chain).name, count: approvals.length,
                approvals: approvals.slice(0, 30).map(a => ({ token: a.tokenSymbol, spender: a.spender, spenderLabel: a.spenderLabel, amount: a.amount, unlimited: a.unlimited, usdAtRisk: round(a.usdAtRisk), approvedAt: a.approvedAt }))
            };
        }
    }),
    tool({
        name: 'get_defi_positions',
        title: 'DeFi positions',
        description: 'A wallet\'s positions in DeFi protocols (lending, liquidity, staking) with USD values.',
        input: z.object({ address: wallet, chain }),
        async run({ address, chain }) {
            requireMarketValue(chain);
            const resolved = await resolveWallet(address);
            const positions = await getDefiPositions(resolved, chain);
            return { address: resolved, chain: chainInfo(chain).name, positions: positions.slice(0, 20) };
        }
    }),
    tool({
        name: 'resolve_ens',
        title: 'Resolve ENS',
        description: 'Turns an ENS name into an address, or an address into its primary ENS name.',
        input: z.object({ nameOrAddress: z.string().trim().min(3).max(100) }),
        async run({ nameOrAddress }) {
            if (isAddress(nameOrAddress, { strict: false })) {
                const address = getAddress(nameOrAddress);
                return { address, ensName: await lookupEnsName(address) };
            }
            return { ensName: nameOrAddress, address: await resolveEnsName(nameOrAddress) };
        }
    }),
    tool({
        name: 'get_gas',
        title: 'Gas prices',
        description: 'Current Ethereum gas: next block base fee and total gas price at 70-99% confidence of inclusion, in gwei.',
        input: noInput,
        async run() {
            const gas = await getGasEstimate();
            const next = gas.blockPrices[0];
            return { currentBlock: gas.currentBlockNumber, nextBaseFeeGwei: next.baseFeePerGas, estimates: next.estimatedPrices };
        }
    }),
    tool({
        name: 'get_token_price',
        title: 'Token price',
        description: 'USD price, 24h change and market cap of a coin, by CoinGecko ID, symbol or name (e.g. ethereum, ETH, Chainlink).',
        input: z.object({ coin: z.string().trim().min(1).max(60) }),
        async run({ coin }) {
            const query = coin.toLowerCase();
            const markets = await getTopMarkets();
            const match = markets.find(m => m.id === query) ?? markets.find(m => m.symbol.toLowerCase() === query) ?? markets.find(m => m.name.toLowerCase() === query);
            if (match) return { id: match.id, name: match.name, symbol: match.symbol.toUpperCase(), usd: match.current_price, change24hPercent: round(match.price_change_percentage_24h), marketCapUsd: match.market_cap, rank: match.market_cap_rank };
            if (!/^[a-z0-9-]+$/.test(query)) throw new ToolError(`No coin found for "${coin}"`);
            const prices = await coingecko<Record<string, { usd: number; usd_24h_change?: number; usd_market_cap?: number }>>(`/simple/price?ids=${query}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`, CG_CACHE.lookup);
            const p = prices[query];
            if (!p) throw new ToolError(`No coin found for "${coin}". Try its CoinGecko ID.`);
            return { id: query, usd: p.usd, change24hPercent: round(p.usd_24h_change), marketCapUsd: p.usd_market_cap ?? null };
        }
    }),
    tool({
        name: 'get_market_overview',
        title: 'Market overview',
        description: 'Total crypto market cap and volume, BTC/ETH dominance, and the top 24h gainers and losers among the top 250 coins.',
        input: noInput,
        async run() {
            const [global, markets] = await Promise.all([coingecko<{ data: Record<string, unknown> }>('/global', CG_CACHE.global), getTopMarkets()]);
            const g = global.data as { total_market_cap: { usd: number }; total_volume: { usd: number }; market_cap_percentage: Record<string, number>; market_cap_change_percentage_24h_usd: number };
            const ranked = markets.filter(m => m.price_change_percentage_24h !== null).sort((a, b) => b.price_change_percentage_24h! - a.price_change_percentage_24h!);
            const row = (m: (typeof markets)[number]) => ({ name: m.name, symbol: m.symbol.toUpperCase(), usd: m.current_price, change24hPercent: round(m.price_change_percentage_24h) });
            return {
                marketCapUsd: g.total_market_cap.usd, volume24hUsd: g.total_volume.usd, marketCapChange24hPercent: round(g.market_cap_change_percentage_24h_usd),
                btcDominancePercent: round(g.market_cap_percentage.btc), ethDominancePercent: round(g.market_cap_percentage.eth),
                topCoins: markets.slice(0, 10).map(row), gainers: ranked.slice(0, 5).map(row), losers: ranked.slice(-5).reverse().map(row)
            };
        }
    }),
    tool({
        name: 'get_nft_collection',
        title: 'NFT collection',
        description: 'Floor price, volume, sales and owners of an NFT collection, by OpenSea slug (e.g. pudgypenguins) or contract address.',
        input: z.object({ collection: z.string().trim().min(2).max(100), chain }),
        async run({ collection, chain }) {
            const slug = isAddress(collection, { strict: false }) ? await getCollectionSlug(collection, chain) : collection.toLowerCase();
            const stats = await getCollectionStats(slug);
            return { slug, url: `https://opensea.io/collection/${slug}`, total: stats.total, intervals: stats.intervals };
        }
    }),
    tool({
        name: 'get_validator_queue',
        title: 'Validator queue',
        description: 'Ethereum validator entry and exit queues and the active validator count (Beacon chain).',
        input: noInput,
        async run() {
            return (await getValidatorQueue()).information.data;
        }
    }),
    tool({
        name: 'get_staking_overview',
        title: 'Staking overview',
        description: 'Total ETH staked, staking ratio, base APR, and the largest liquid staking and restaking protocols.',
        input: noInput,
        async run() {
            const s = await getStakingOverview();
            const top = (section: typeof s.liquid) => 'data' in section ? section.data.slice(0, 8) : section;
            return { summary: s.summary, liquidStaking: top(s.liquid), restaking: top(s.restaking) };
        }
    }),
    tool({
        name: 'get_defi_tvl',
        title: 'DeFi TVL',
        description: 'DeFi total value locked by chain and top protocols, DEX volume, fees, stablecoin supply and the best yields (DefiLlama).',
        input: noInput,
        async run() {
            const d = await getDefiOverview();
            const top = <T>(section: { data: T[] } | { error: string }, n: number) => 'data' in section ? section.data.slice(0, n) : section;
            return {
                chains: top(d.chains, 10), protocols: top(d.protocols, 15),
                dexVolume: 'data' in d.dexs ? { ...d.dexs.data, top: d.dexs.data.top.slice(0, 8) } : d.dexs,
                fees: 'data' in d.fees ? { ...d.fees.data, top: d.fees.data.top.slice(0, 8) } : d.fees,
                stablecoins: 'data' in d.stablecoins ? { total: d.stablecoins.data.total, top: d.stablecoins.data.top.slice(0, 8) } : d.stablecoins,
                yields: top(d.yields, 10)
            };
        }
    }),
    tool({
        name: 'get_l2_stats',
        title: 'Layer 2 stats',
        description: 'Value locked, rollup type and L2BEAT risk stage for the supported layer 2s (Base, Arbitrum, OP Mainnet, Polygon, Linea...).',
        input: noInput,
        async run() {
            const l2 = await getL2Overview();
            return { ethereumTvl: l2.ethereumTvl, layer2s: l2.rows.map(r => ({ name: r.name, tvl: r.tvl, category: r.category, stage: r.stage, totalValueSecured: r.tvs })) };
        }
    }),
    tool({
        name: 'decode_transaction',
        title: 'Decode transaction',
        description: 'Details of a transaction by hash: status, from/to, value, fee, and decoded token transfers and approvals.',
        input: z.object({ hash: z.string().trim().refine(v => isHash(v), 'Transaction hash (0x + 64 hex characters)'), chain: explorerChain }),
        async run({ hash, chain }) {
            const tx = await cachedTx(chain, hash);
            if (!tx) throw new ToolError(`Transaction ${hash} was not found on ${chainInfo(chain).name}`);
            const label = (a: string | null) => a ? labelFor(a)?.name ?? null : null;
            return { ...tx, fromLabel: label(tx.from), toLabel: label(tx.to), logs: tx.logs.slice(0, 25), logCount: tx.logs.length };
        }
    }),
    tool({
        name: 'get_address_info',
        title: 'Address info',
        description: 'Native balance, transaction count, and whether an address is a contract or token, with its known label.',
        input: z.object({ address: wallet, chain: explorerChain }),
        async run({ address, chain }) {
            const resolved = await resolveWallet(address);
            const details = await cachedAddress(chain, resolved);
            if (!details) throw new ToolError(`No data for ${resolved}`);
            return { ...details, label: labelFor(resolved)?.name ?? null };
        }
    }),
    tool({
        name: 'check_token_risk',
        title: 'Token risk check',
        description: 'GoPlus security check of an ERC20 token: honeypot, taxes, mintable, owner privileges, holder count.',
        input: z.object({ token: z.string().trim().refine(v => isAddress(v, { strict: false }), 'Token contract address'), chain }),
        async run({ token, chain }) {
            requireMarketValue(chain);
            const risks = await getTokenRisks(chain, [token]);
            const risk = risks[token.toLowerCase()];
            if (!risk) throw new ToolError('GoPlus has no data for this token');
            return risk;
        }
    }),
    tool({
        name: 'get_eth_supply',
        title: 'ETH supply',
        description: 'ETH issued vs burnt over the last day, whether supply is inflating or deflating, and the blob fee burn.',
        input: noInput,
        async run() {
            const supply = await getEthSupply();
            if ('error' in supply) throw new ToolError(supply.error);
            return supply.data;
        }
    }),
    tool({
        name: 'get_governance_proposals',
        title: 'Governance proposals',
        description: 'Active and recently closed Snapshot votes for major DAOs (Aave, Uniswap, ENS, Lido, Arbitrum...).',
        input: noInput,
        async run() {
            const g = await getGovernance();
            if ('error' in g) throw new ToolError(g.error);
            return { active: g.data.active.slice(0, 15), recentlyClosed: g.data.closed.slice(0, 10) };
        }
    }),
    tool({
        name: 'get_derivatives',
        title: 'ETH derivatives',
        description: 'ETH perpetual funding rates and open interest (Deribit, OKX, Bybit) and the options market summary.',
        input: noInput,
        async run() {
            return getDerivatives();
        }
    })
];

export const toolByName = (name: string) => TOOLS.find(t => t.name === name);

// Runs a tool with validated input. Throws ZodError for bad input and ToolError / ProviderError for failures.
export async function runTool(name: string, input: unknown): Promise<unknown> {
    const t = toolByName(name);
    if (!t) throw new ToolError(`Unknown tool: ${name}`);
    return t.run(t.input.parse(input ?? {}));
}

// A short, safe error message for the model or MCP client
export function toolErrorMessage(err: unknown): string {
    if (err instanceof z.ZodError) return 'Invalid input: ' + err.issues.map(i => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ');
    if (err instanceof ToolError) return err.message;
    if (err instanceof ProviderError) return err.isPlanRestricted ? `${err.provider} rejected the request (not available on the free plan)` : err.message;
    return 'The data source failed. Try again later.';
}
