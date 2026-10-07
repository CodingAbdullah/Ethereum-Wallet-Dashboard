import { formatEther } from "viem";
import { moralis, moralisChain } from "./providers/moralis";
import { etherscan } from "./providers/etherscan";
import { ProviderError } from "./providers/http";
import type { Network } from "./validation";
import { hasMarketValue } from "./chains";

// Portfolio data for /me: holdings with USD values, NFTs, PnL and recent activity for each saved wallet,
// plus a combined view. Each section loads on its own, so one provider failing (or PnL being outside
// the Moralis free plan) leaves the rest of the page working.

export interface PortfolioWallet {
    id: number;
    address: string;
    chain: string;
    label: string | null;
}

export interface TokenHolding {
    tokenAddress: string;
    symbol: string;
    name: string;
    logo: string | null;
    balance: number;
    usdPrice: number | null;
    usdValue: number;
    change24h: number | null;
    native: boolean;
}

export interface NftHolding {
    tokenAddress: string;
    tokenId: string;
    name: string | null;
}

export interface WalletPnl {
    realizedProfitUsd: number | null;
    realizedProfitPercent: number | null;
    tradeVolumeUsd: number | null;
    trades: number | null;
}

export interface WalletTransaction {
    hash: string;
    timestamp: number;
    from: string;
    to: string;
    valueEth: number;
    failed: boolean;
}

export type Section<T> = { data: T } | { error: string };

export interface WalletPortfolio {
    wallet: PortfolioWallet;
    usdValue: number | null;
    tokens: Section<TokenHolding[]>;
    nfts: Section<{ items: NftHolding[]; hasMore: boolean }>;
    pnl: Section<WalletPnl> | null; // null on testnets, where Moralis has no PnL
    activity: Section<WalletTransaction[]>;
}

export interface CombinedHolding extends TokenHolding {
    chain: string;
    wallets: number;
}

export interface Portfolio {
    totalUsd: number;
    incomplete: boolean; // true when a wallet's holdings failed to load, so the total is missing something
    wallets: WalletPortfolio[];
    holdings: CombinedHolding[];
    activity: (WalletTransaction & { wallet: string; chain: string })[];
}

const NFT_LIMIT = 20;
const ACTIVITY_LIMIT = 10;

// Moralis /wallets/{address}/tokens: balances with prices, native ETH included
interface MoralisToken {
    token_address: string;
    symbol: string | null;
    name: string | null;
    logo: string | null;
    balance_formatted: string | null;
    usd_price: number | null;
    usd_value: number | null;
    usd_price_24hr_percent_change: number | null;
    native_token: boolean;
}

export function toHoldings(tokens: MoralisToken[]): TokenHolding[] {
    return tokens
        .map(token => ({
            tokenAddress: token.native_token ? 'native' : token.token_address.toLowerCase(),
            symbol: token.symbol ?? '?',
            name: token.name ?? token.symbol ?? 'Unknown token',
            logo: token.logo ?? null,
            balance: Number(token.balance_formatted ?? 0),
            usdPrice: token.usd_price ?? null,
            usdValue: Number.isFinite(token.usd_value) ? Number(token.usd_value) : 0,
            change24h: token.usd_price_24hr_percent_change ?? null,
            native: !!token.native_token
        }))
        .filter(token => token.balance > 0)
        .sort((a, b) => b.usdValue - a.usdValue);
}

export async function getWalletTokens(address: string, chain: Network): Promise<TokenHolding[]> {
    const data = await moralis<{ result: MoralisToken[] }>(
        '/wallets/' + address + '/tokens?chain=' + moralisChain(chain) + '&exclude_spam=true&exclude_unverified_contracts=true&limit=100',
        300
    );
    return toHoldings(data.result ?? []);
}

async function getWalletNfts(address: string, chain: Network) {
    const data = await moralis<{ cursor: string | null; result: { token_address: string; token_id: string; name: string | null }[] }>(
        '/' + address + '/nft?chain=' + moralisChain(chain) + '&format=decimal&exclude_spam=true&limit=' + NFT_LIMIT,
        300
    );
    return {
        items: (data.result ?? []).map(nft => ({ tokenAddress: nft.token_address, tokenId: nft.token_id, name: nft.name })),
        hasMore: !!data.cursor
    };
}

const num = (value: unknown): number | null => {
    const n = Number(value);
    return value === null || value === undefined || !Number.isFinite(n) ? null : n;
};

async function getWalletPnl(address: string, chain: Network): Promise<WalletPnl> {
    const data = await moralis<Record<string, unknown>>('/wallets/' + address + '/profitability/summary?chain=' + moralisChain(chain), 600);
    return {
        realizedProfitUsd: num(data.total_realized_profit_usd),
        realizedProfitPercent: num(data.total_realized_profit_percentage),
        tradeVolumeUsd: num(data.total_trade_volume),
        trades: num(data.total_count_of_trades)
    };
}

async function getWalletActivity(address: string, chain: Network): Promise<WalletTransaction[]> {
    const data = await etherscan<{ hash: string; timeStamp: string; from: string; to: string; value: string; isError: string }[]>({
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: ACTIVITY_LIMIT,
        sort: 'desc'
    }, chain, 60);

    return data.result.map(tx => ({
        hash: tx.hash,
        timestamp: Number(tx.timeStamp),
        from: tx.from,
        to: tx.to,
        valueEth: Number(formatEther(BigInt(tx.value || '0'))),
        failed: tx.isError === '1'
    }));
}

function sectionError(err: unknown): string {
    if (err instanceof ProviderError) {
        return err.isPlanRestricted
            ? `${err.provider} rejected the request (missing key, or not on the free plan)`
            : `${err.provider} is unavailable right now`;
    }
    return 'Could not load this data';
}

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try {
        return { data: await load() };
    }
    catch (err) {
        return { error: sectionError(err) };
    }
}

export async function getWalletPortfolio(wallet: PortfolioWallet): Promise<WalletPortfolio> {
    const chain = wallet.chain as Network;
    const [tokens, nfts, pnl, activity] = await Promise.all([
        section(() => getWalletTokens(wallet.address, chain)),
        section(() => getWalletNfts(wallet.address, chain)),
        hasMarketValue(chain) ? section(() => getWalletPnl(wallet.address, chain)) : Promise.resolve(null),
        section(() => getWalletActivity(wallet.address, chain))
    ]);

    // Testnet tokens have no market value
    const usdValue = 'data' in tokens ? (hasMarketValue(chain) ? tokens.data.reduce((sum, t) => sum + t.usdValue, 0) : 0) : null;
    return { wallet, usdValue, tokens, nfts, pnl, activity };
}

// Combines wallets into one portfolio: total value, holdings merged by token, newest activity first
export function combinePortfolio(wallets: WalletPortfolio[]): Portfolio {
    const holdings = new Map<string, CombinedHolding>();
    for (const { wallet, tokens } of wallets) {
        if (!('data' in tokens) || !hasMarketValue(wallet.chain)) continue;
        for (const token of tokens.data) {
            const key = wallet.chain + ':' + token.tokenAddress;
            const existing = holdings.get(key);
            if (existing) {
                existing.balance += token.balance;
                existing.usdValue += token.usdValue;
                existing.wallets += 1;
            }
            else {
                holdings.set(key, { ...token, chain: wallet.chain, wallets: 1 });
            }
        }
    }

    const activity = wallets
        .flatMap(({ wallet, activity }) => 'data' in activity ? activity.data.map(tx => ({ ...tx, wallet: wallet.address, chain: wallet.chain })) : [])
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15);

    return {
        totalUsd: wallets.reduce((sum, w) => sum + (w.usdValue ?? 0), 0),
        incomplete: wallets.some(w => w.usdValue === null),
        wallets,
        holdings: [...holdings.values()].sort((a, b) => b.usdValue - a.usdValue),
        activity
    };
}

export async function getPortfolio(wallets: PortfolioWallet[]): Promise<Portfolio> {
    return combinePortfolio(await Promise.all(wallets.map(getWalletPortfolio)));
}
