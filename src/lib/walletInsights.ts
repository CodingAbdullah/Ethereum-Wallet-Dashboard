import { moralis, moralisChain } from "./providers/moralis";
import type { Network } from "./validation";

// Extra wallet data from Moralis's free Wallet API: token approvals, DeFi positions and a
// human-readable activity feed. Responses are read defensively: unknown or missing fields
// become null instead of breaking the page.

export interface TokenApproval {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    tokenLogo: string | null;
    spender: string;
    spenderLabel: string | null;
    amount: string;           // formatted amount, or "Unlimited"
    unlimited: boolean;
    usdAtRisk: number | null;
    approvedAt: string | null;
    transactionHash: string | null;
}

export interface DefiPosition {
    protocol: string;
    protocolUrl: string | null;
    protocolLogo: string | null;
    label: string;
    tokens: { symbol: string; balance: number | null; usdValue: number | null }[];
    usdValue: number | null;
    unclaimedUsd: number | null;
}

export interface ActivityItem {
    hash: string;
    timestamp: string;
    category: string;
    summary: string;
    possibleSpam: boolean;
}

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const str = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// ERC20 approvals are "unlimited" when set to (close to) the max uint256
const MAX_UINT_DIGITS = 70;

export function toApprovals(data: unknown): TokenApproval[] {
    return list(obj(data).result)
        // Approvals of spam tokens are noise, not risk
        .filter(raw => obj(obj(raw).token).possible_spam !== true)
        .map((raw): TokenApproval => {
            const item = obj(raw);
            const token = obj(item.token);
            const spender = obj(item.spender);
            const rawValue = str(item.value) ?? '';
            const formatted = str(item.value_formatted) ?? rawValue;
            const unlimited = /unlimited/i.test(formatted) || rawValue.length >= MAX_UINT_DIGITS;
            return {
                tokenAddress: (str(token.address) ?? '').toLowerCase(),
                tokenSymbol: str(token.symbol) ?? '?',
                tokenName: str(token.name) ?? str(token.symbol) ?? 'Unknown token',
                tokenLogo: str(token.logo),
                spender: str(spender.address) ?? '',
                spenderLabel: str(spender.address_label) ?? str(spender.entity),
                amount: unlimited ? 'Unlimited' : formatted,
                unlimited,
                usdAtRisk: num(token.usd_at_risk),
                approvedAt: str(item.block_timestamp),
                transactionHash: str(item.transaction_hash)
            };
        })
        .filter(a => a.tokenAddress && a.spender)
        // Riskiest first: most value exposed, then unlimited approvals
        .sort((a, b) => (b.usdAtRisk ?? 0) - (a.usdAtRisk ?? 0) || Number(b.unlimited) - Number(a.unlimited));
}

export function toDefiPositions(data: unknown): DefiPosition[] {
    // The endpoint returns an array of protocols (some versions wrap it in { result })
    const rows = Array.isArray(data) ? data : list(obj(data).result);
    return rows
        .map(raw => {
            const item = obj(raw);
            const position = obj(item.position);
            return {
                protocol: str(item.protocol_name) ?? str(item.protocol_id) ?? 'Unknown protocol',
                protocolUrl: str(item.protocol_url),
                protocolLogo: str(item.protocol_logo),
                label: str(position.label) ?? 'position',
                tokens: list(position.tokens).map(t => {
                    const token = obj(t);
                    return { symbol: str(token.symbol) ?? '?', balance: num(token.balance_formatted), usdValue: num(token.usd_value) };
                }),
                usdValue: num(position.balance_usd),
                unclaimedUsd: num(position.total_unclaimed_usd_value)
            };
        })
        .sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));
}

export function toActivity(data: unknown): ActivityItem[] {
    return list(obj(data).result)
        .map(raw => {
            const item = obj(raw);
            return {
                hash: str(item.hash) ?? '',
                timestamp: str(item.block_timestamp) ?? '',
                category: str(item.category) ?? 'contract interaction',
                summary: str(item.summary) ?? str(item.method_label) ?? 'Contract interaction',
                possibleSpam: item.possible_spam === true
            };
        })
        .filter(a => a.hash && !a.possibleSpam);
}

export async function getApprovals(address: string, chain: Network): Promise<TokenApproval[]> {
    return toApprovals(await moralis('/wallets/' + address + '/approvals?chain=' + moralisChain(chain) + '&limit=100', 600));
}

export async function getDefiPositions(address: string): Promise<DefiPosition[]> {
    // DeFi protocols have no testnet data, so mainnet only
    return toDefiPositions(await moralis('/wallets/' + address + '/defi/positions?chain=eth', 600));
}

export async function getActivity(address: string, chain: Network, limit = 15): Promise<ActivityItem[]> {
    return toActivity(await moralis('/wallets/' + address + '/history?chain=' + moralisChain(chain) + '&order=DESC&include_internal_transactions=false&limit=' + limit, 120));
}

export interface InsightWallet {
    address: string;
    chain: string;
}

// Approvals, DeFi positions and activity for one or more wallets. Each list notes which wallets
// failed to load, so the page can say "couldn't load 1 wallet" instead of showing nothing.
export interface WalletInsights {
    approvals: { items: (TokenApproval & { wallet: string })[]; failed: string[] };
    defi: { items: (DefiPosition & { wallet: string })[]; totalUsd: number; failed: string[] };
    activity: { items: (ActivityItem & { wallet: string; chain: string })[]; failed: string[] };
}

async function settle<T>(wallets: InsightWallet[], load: (wallet: InsightWallet) => Promise<T[]>) {
    const results = await Promise.allSettled(wallets.map(load));
    const items: (T & { wallet: string; chain: string })[] = [];
    const failed: string[] = [];
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') items.push(...result.value.map(item => ({ ...item, wallet: wallets[i].address, chain: wallets[i].chain })));
        else failed.push(wallets[i].address);
    });
    return { items, failed };
}

export async function getWalletInsights(wallets: InsightWallet[], activityLimit = 20): Promise<WalletInsights> {
    // Approvals and DeFi positions only matter where tokens have value
    const mainnet = wallets.filter(w => w.chain === 'eth');
    const [approvals, defi, activity] = await Promise.all([
        settle(mainnet, w => getApprovals(w.address, 'eth')),
        settle(mainnet, w => getDefiPositions(w.address)),
        settle(wallets, w => getActivity(w.address, w.chain as Network))
    ]);

    return {
        approvals: {
            items: approvals.items.sort((a, b) => (b.usdAtRisk ?? 0) - (a.usdAtRisk ?? 0) || Number(b.unlimited) - Number(a.unlimited)),
            failed: approvals.failed
        },
        defi: {
            items: defi.items.sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0)),
            totalUsd: defi.items.reduce((sum, p) => sum + (p.usdValue ?? 0), 0),
            failed: defi.failed
        },
        activity: {
            items: activity.items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, activityLimit),
            failed: activity.failed
        }
    };
}
