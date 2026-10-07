import { providerFetch } from "./providers/http";
import { chainInfo } from "./chains";

// Token risk checks from GoPlus Security's free token API (no key needed at low volume).
// Each flag is turned into a plain-language finding, then an overall level:
//   danger  - can trap or take your tokens (honeypot, can't sell, owner can change balances, ...)
//   caution - has powers worth knowing about (mintable, pausable, blacklist, proxy, taxes, ...)
//   ok      - nothing notable found
// Big stablecoins legitimately have caution flags (USDC can blacklist), so "trusted" lists soften them.

export type RiskLevel = 'danger' | 'caution' | 'ok';

export interface TokenRisk {
    address: string;
    level: RiskLevel;
    trusted: boolean;
    findings: { level: Exclude<RiskLevel, 'ok'>; text: string }[];
    buyTax: number | null;
    sellTax: number | null;
    holders: number | null;
}

type Json = Record<string, unknown>;
const flag = (r: Json, key: string) => r[key] === '1' || r[key] === 1;
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const DANGER: [string, string][] = [
    ['is_honeypot', 'Honeypot: tokens can be bought but not sold'],
    ['cannot_sell_all', 'Holders can\'t sell their full balance'],
    ['owner_change_balance', 'The owner can change anyone\'s balance'],
    ['hidden_owner', 'Has a hidden owner'],
    ['selfdestruct', 'The contract can self-destruct'],
    ['can_take_back_ownership', 'Ownership can be taken back after being renounced'],
    ['is_airdrop_scam', 'Flagged as an airdrop scam']
];

const CAUTION: [string, string][] = [
    ['is_mintable', 'The owner can mint new tokens'],
    ['transfer_pausable', 'Transfers can be paused'],
    ['is_blacklisted', 'Addresses can be blacklisted'],
    ['is_proxy', 'Upgradeable proxy: the code can be changed'],
    ['trading_cooldown', 'Has a trading cooldown'],
    ['slippage_modifiable', 'The owner can change the tax'],
    ['personal_slippage_modifiable', 'The owner can set taxes per address']
];

export function assessToken(address: string, raw: unknown): TokenRisk {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Json;
    const findings: TokenRisk['findings'] = [];
    for (const [key, text] of DANGER) if (flag(r, key)) findings.push({ level: 'danger', text });
    const buyTax = num(r.buy_tax);
    const sellTax = num(r.sell_tax);
    if ((sellTax ?? 0) >= 0.5) findings.push({ level: 'danger', text: `Sell tax of ${Math.round(sellTax! * 100)}%` });
    for (const [key, text] of CAUTION) if (flag(r, key)) findings.push({ level: 'caution', text });
    if (r.is_open_source === '0') findings.push({ level: 'caution', text: 'Contract source code isn\'t verified' });
    const maxTax = Math.max(buyTax ?? 0, sellTax ?? 0);
    if (maxTax >= 0.05 && (sellTax ?? 0) < 0.5) findings.push({ level: 'caution', text: `Buy/sell tax up to ${Math.round(maxTax * 100)}%` });

    const trusted = flag(r, 'trust_list');
    const level: RiskLevel = findings.some(f => f.level === 'danger') ? 'danger' : findings.length && !trusted ? 'caution' : 'ok';
    return { address: address.toLowerCase(), level, trusted, findings, buyTax, sellTax, holders: num(r.holder_count) };
}

export const MAX_RISK_BATCH = 30;

// Risk for several tokens on one chain. Tokens GoPlus doesn't know are left out of the result.
export async function getTokenRisks(chain: string, addresses: string[]): Promise<Record<string, TokenRisk>> {
    const unique = [...new Set(addresses.map(a => a.toLowerCase()))].sort().slice(0, MAX_RISK_BATCH);
    if (unique.length === 0) return {};
    const data = await providerFetch<{ code?: number; result?: Record<string, unknown> }>(
        'GoPlus',
        `https://api.gopluslabs.io/api/v1/token_security/${chainInfo(chain).chainId}?contract_addresses=${unique.join(',')}`,
        { revalidate: 3600 }
    );
    const result: Record<string, TokenRisk> = {};
    for (const [address, raw] of Object.entries(data.result ?? {})) result[address.toLowerCase()] = assessToken(address, raw);
    return result;
}
