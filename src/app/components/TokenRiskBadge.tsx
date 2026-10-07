'use client';

import useSWR from 'swr';
import { ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { TokenRisk } from '@/lib/tokenRisk';

// GoPlus risk badges. Status is shown with an icon and a word, never by color alone.

export type TokenRef = { chain: string; address: string };

async function fetchRisks(refs: TokenRef[]): Promise<Record<string, TokenRisk>> {
    const byChain = new Map<string, string[]>();
    for (const r of refs) {
        if (!/^0x[0-9a-fA-F]{40}$/.test(r.address)) continue;           // skips native ETH rows
        byChain.set(r.chain, [...(byChain.get(r.chain) ?? []), r.address]);
    }
    const results = await Promise.all([...byChain.entries()].map(async ([chain, addresses]) => {
        const response = await fetch('/api/token-risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chain, addresses: addresses.slice(0, 30) })
        });
        if (!response.ok) return {} as Record<string, TokenRisk>;
        const risks: Record<string, TokenRisk> = await response.json();
        return Object.fromEntries(Object.entries(risks).map(([address, risk]) => [chain + ':' + address, risk]));
    }));
    return Object.assign({}, ...results);
}

// Loads risk for a list of tokens; look results up with riskKey(chain, address)
export function useTokenRisks(refs: TokenRef[]) {
    const key = refs.length ? ['token-risk', ...refs.map(r => r.chain + ':' + r.address.toLowerCase()).sort()] : null;
    return useSWR(key, () => fetchRisks(refs), { revalidateOnFocus: false });
}

export const riskKey = (chain: string, address: string) => chain + ':' + address.toLowerCase();

const STYLES = {
    danger: { icon: ShieldAlert, text: 'Risky', className: 'text-red-300 ring-red-500/50' },
    caution: { icon: TriangleAlert, text: 'Caution', className: 'text-amber-300 ring-amber-500/50' },
    ok: { icon: ShieldCheck, text: 'No issues', className: 'text-gray-300 ring-gray-600' }
} as const;

export function RiskBadge({ risk, compact = false }: { risk: TokenRisk | undefined; compact?: boolean }) {
    if (!risk) return null;
    // Keep tables quiet: only show "ok" when not compact
    if (compact && risk.level === 'ok') return null;
    const style = STYLES[risk.level];
    const Icon = style.icon;
    const title = risk.findings.length ? risk.findings.map(f => f.text).join('\n') : risk.trusted ? 'On GoPlus trust list' : 'GoPlus found no issues';
    return (
        <span title={title} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ring-1 whitespace-nowrap ${style.className}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />{style.text}
        </span>
    );
}

// Full findings for one token (token page)
export function TokenRiskDetails({ chain, address }: TokenRef) {
    const { data, error, isLoading } = useTokenRisks([{ chain, address }]);
    const risk = data?.[riskKey(chain, address)];
    if (isLoading) return <p className="text-gray-400">Checking…</p>;
    if (error || !data) return <p className="text-gray-500">Security check unavailable right now.</p>;
    if (!risk) return <p className="text-gray-500">GoPlus has no data for this token.</p>;
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <RiskBadge risk={risk} />
                {risk.trusted && <span className="text-sm text-gray-400">On GoPlus&apos;s trust list</span>}
                {risk.holders !== null && <span className="text-sm text-gray-400">{risk.holders.toLocaleString('en-US')} holders</span>}
                {(risk.buyTax !== null || risk.sellTax !== null) && <span className="text-sm text-gray-400">Tax: buy {((risk.buyTax ?? 0) * 100).toFixed(1)}% / sell {((risk.sellTax ?? 0) * 100).toFixed(1)}%</span>}
            </div>
            {risk.findings.length > 0 && (
                <ul className="space-y-1">
                    {risk.findings.map(f => (
                        <li key={f.text} className="flex items-start gap-2 text-sm">
                            {f.level === 'danger' ? <ShieldAlert className="h-4 w-4 mt-0.5 text-red-300 shrink-0" aria-label="Danger" /> : <TriangleAlert className="h-4 w-4 mt-0.5 text-amber-300 shrink-0" aria-label="Caution" />}
                            <span className="text-gray-200">{f.text}</span>
                        </li>
                    ))}
                </ul>
            )}
            <p className="text-xs text-gray-500">Automated checks by GoPlus Security. A clean result isn&apos;t a guarantee.</p>
        </div>
    );
}
