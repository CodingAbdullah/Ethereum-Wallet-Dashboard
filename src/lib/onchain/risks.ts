import { decodeFunctionData, erc20Abi, erc721Abi, isAddressEqual, maxUint256, type Address } from "viem";
import { chainInfo, hasMarketValue } from "../chains";
import { providerFetch } from "../providers/http";
import { getTokenRisks, type TokenRisk } from "../tokenRisk";
import { labelFor } from "../labels";
import type { AssetChange, TxCall } from "./simulate";

// Plain-English warnings shown in the transaction preview, before the user signs:
// - what each call does that deserves attention (unlimited approvals, approval for all NFTs,
//   tokens sent to the token contract itself)
// - GoPlus address security for the addresses the transaction sends to or approves
// - GoPlus token security for every token whose balance changes

export type RiskLevel = 'danger' | 'warning' | 'info';
export interface RiskFlag { level: RiskLevel; text: string }

const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);
const name = (a: string) => labelFor(a)?.name ?? short(a);

// GoPlus address_security fields that mean "don't send money here"
const ADDRESS_FLAGS: Record<string, string> = {
    phishing_activities: 'phishing',
    stealing_attack: 'stealing funds',
    cybercrime: 'cybercrime',
    money_laundering: 'money laundering',
    financial_crime: 'financial crime',
    sanctioned: 'being sanctioned',
    blackmail_activities: 'blackmail',
    honeypot_related_address: 'honeypot scams',
    fake_token: 'fake tokens',
    fake_kyc: 'fake KYC',
    malicious_mining_activities: 'malicious mining',
    darkweb_transactions: 'dark web transactions',
    mixer: 'using a mixer',
    blacklist_doubt: 'being blacklisted'
};

export function addressFlags(address: string, result: Record<string, unknown> | undefined): RiskFlag[] {
    if (!result) return [];
    const reasons = Object.entries(ADDRESS_FLAGS).filter(([key]) => result[key] === '1').map(([, text]) => text);
    if (Number(result.number_of_malicious_contracts_created) > 0) reasons.push('creating malicious contracts');
    return reasons.length ? [{ level: 'danger', text: `${name(address)} is flagged by GoPlus for ${reasons.join(', ')}. Do not continue unless you are sure.` }] : [];
}

async function screenAddress(chainId: number, address: string): Promise<RiskFlag[]> {
    const data = await providerFetch<{ result?: Record<string, unknown> }>(
        'GoPlus', `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=${chainId}`, { revalidate: 3600 }
    );
    return addressFlags(address, data.result);
}

// The addresses a call sends value to, or gives control to
export function counterparties(calls: TxCall[]): Address[] {
    const found = new Set<string>();
    for (const call of calls) {
        if (!call.data || call.data === '0x') { found.add(call.to.toLowerCase()); continue; }
        try {
            const { functionName, args } = decodeFunctionData({ abi: [...erc20Abi, ...erc721Abi], data: call.data });
            if (functionName === 'transfer' || functionName === 'approve' || functionName === 'setApprovalForAll') found.add(String(args[0]).toLowerCase());
            if (functionName === 'transferFrom' || functionName === 'safeTransferFrom') found.add(String(args[1]).toLowerCase());
        }
        catch { /* not a token call */ }
    }
    return [...found] as Address[];
}

export function callFlags(calls: TxCall[]): RiskFlag[] {
    const flags: RiskFlag[] = [];
    for (const call of calls) {
        if (!call.data || call.data === '0x') continue;
        let decoded;
        try { decoded = decodeFunctionData({ abi: [...erc20Abi, ...erc721Abi], data: call.data }); }
        catch { continue; }
        const { functionName, args } = decoded;
        if (functionName === 'approve' && typeof args[1] === 'bigint') {
            const spender = String(args[0]);
            if (args[1] >= maxUint256 / BigInt(2)) {
                flags.push({ level: labelFor(spender) ? 'warning' : 'danger', text: `Unlimited approval: ${name(spender)} could spend all of this token, now and later.${labelFor(spender) ? '' : ' This spender is not a known protocol.'}` });
            }
        }
        if (functionName === 'setApprovalForAll' && args[1] === true) {
            flags.push({ level: 'danger', text: `${name(String(args[0]))} would be able to move every NFT you own in this collection.` });
        }
        if (functionName === 'transfer' && isAddressEqual(String(args[0]) as Address, call.to)) {
            flags.push({ level: 'danger', text: 'You are sending tokens to the token contract itself. They will almost certainly be lost.' });
        }
    }
    return flags;
}

export async function assessTransaction(chain: string, calls: TxCall[], assetChanges: AssetChange[], extraAddresses: string[] = []): Promise<RiskFlag[]> {
    const flags = callFlags(calls);
    if (!hasMarketValue(chain)) return flags;            // GoPlus doesn't cover testnets
    const chainId = chainInfo(chain).chainId;
    const addresses = [...new Set([...counterparties(calls), ...extraAddresses.map(a => a.toLowerCase())])].slice(0, 5);
    const tokens = assetChanges.filter(c => c.token !== 'native').map(c => c.token as string);

    const [addressResults, tokenRisks] = await Promise.all([
        Promise.allSettled(addresses.map(a => screenAddress(chainId, a))),
        tokens.length ? getTokenRisks(chain, tokens).catch(() => null) : Promise.resolve({} as Record<string, TokenRisk>)
    ]);
    addressResults.forEach(r => { if (r.status === 'fulfilled') flags.push(...r.value); });
    if (addressResults.some(r => r.status === 'rejected')) flags.push({ level: 'info', text: 'The address security check is unavailable right now.' });

    if (tokenRisks === null) flags.push({ level: 'info', text: 'The token security check is unavailable right now.' });
    else {
        for (const change of assetChanges) {
            const risk = change.token !== 'native' ? tokenRisks[change.token.toLowerCase()] : undefined;
            if (!risk || risk.level === 'ok') continue;
            const worst = risk.findings.filter(f => f.level === risk.level).map(f => f.text).slice(0, 2).join('; ');
            flags.push({ level: risk.level === 'danger' ? 'danger' : 'warning', text: `${change.symbol}: ${worst || 'flagged by GoPlus'}` });
        }
    }
    return flags;
}
