import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import GovernanceSection from "./GovernanceSection";
import L2OverviewSection from "./L2OverviewSection";
import DerivativesSection from "./DerivativesSection";
import MevSection from "./MevSection";

// These sections now get their data from the server (ServerSection) instead of fetching it in the browser.
// Rendering them with data checks the server-rendered path end to end, including the error states.
const html = (el: ReturnType<typeof createElement>) => renderToString(el).replace(/<!-- -->/g, '');
const now = Math.floor(Date.now() / 1000);

describe("server-rendered sections", () => {
    it("governance: lists active and closed votes, or the provider error", () => {
        const proposal = { id: '1', space: 'aave.eth', spaceName: 'Aave', title: 'Raise caps', state: 'active' as const, start: now - 100, end: now + 90_000, votes: 1234, leading: { choice: 'For', percent: 92 }, quorumReached: true, link: 'https://snapshot.box/x' };
        const out = html(createElement(GovernanceSection, { data: { data: { active: [proposal], closed: [] } } }));
        expect(out).toContain('Raise caps');
        expect(out).toContain('1,234 votes');
        expect(out).toContain('Nothing closed recently.');
        expect(html(createElement(GovernanceSection, { data: { error: 'Snapshot is unavailable right now' } }))).toContain('Snapshot is unavailable right now');
    });

    it("layer 2s: totals value locked and shows stages", () => {
        const row = { key: 'base', name: 'Base', website: 'https://base.org', chain: 'base', tvl: 4_000_000_000, category: 'Optimistic Rollup', stage: 'Stage 1', tvs: 9_000_000_000 };
        const out = html(createElement(L2OverviewSection, { data: { rows: [row], ethereumTvl: 60_000_000_000, sources: { defillama: true, l2beat: true } } }));
        expect(out).toContain('Base');
        expect(out).toContain('Stage 1');
        expect(out).toMatch(/\$4(\.0)?B/);
    });

    it("derivatives and MEV render their summaries", () => {
        const perp = { exchange: 'OKX', market: 'ETH-USDT-SWAP', price: 3000, funding8h: 0.0001, fundingAnnualized: 0.1095, openInterestUsd: 2_000_000_000, volume24hUsd: 5_000_000_000 };
        const derivatives = html(createElement(DerivativesSection, { data: {
            perps: [{ exchange: 'OKX', result: { data: perp } }, { exchange: 'Bybit', result: { error: 'Bybit is unavailable right now' } }],
            averageFunding8h: 0.0001, totalOpenInterestUsd: 2_000_000_000,
            options: { data: { openInterestEth: 1_000_000, openInterestUsd: 3_000_000_000, volume24hUsd: 400_000_000, putCallRatio: 0.65, topExpiries: [] } }
        } as never }));
        expect(derivatives).toContain('OKX');
        expect(derivatives).toContain('Bybit is unavailable right now');
        expect(html(createElement(MevSection, { data: { error: 'Relays are unavailable right now' } }))).toContain('Relays are unavailable right now');
    });
});
