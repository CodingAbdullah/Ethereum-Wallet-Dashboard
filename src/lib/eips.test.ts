import { describe, expect, it, vi } from "vitest";
import { mockFetch } from "@/test/helpers";
import { readFileSync } from "node:fs";
import { fetchEip, getEipData, parseFrontMatter, parseMainnetActivation, parseUpgradeSections, toEipInfo } from "./eips";

vi.mock("next/cache", () => ({ unstable_cache: (fn: (...args: unknown[]) => unknown) => fn }));

const text = (body: string, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/plain' } });

const eip = (n: number, title: string, status: string, category = 'Core') => `---
eip: ${n}
title: ${title}
description: Something
author: Someone (@someone)
discussions-to: https://ethereum-magicians.org/t/x
status: ${status}
type: Standards Track
category: ${category}
created: 2024-01-02
---

## Abstract
Text mentioning EIP-1 that is not a list.
`;

const meta = `---
eip: 7773
title: "Hardfork Meta - Glamsterdam"
status: Draft
type: Meta
created: 2024-09-26
requires: 7607
---

## Abstract

This Meta EIP lists the EIPs formally Scheduled for Inclusion in the Glamsterdam network upgrade. See EIP-7607.

## Specification

### Scheduled for Inclusion

* EIP-7732: Enshrined Proposer-Builder Separation
* [EIP-7928](./eip-7928.md): Block-level Access Lists

### Considered for Inclusion

* EIP-7805, EIP-7928 (again)

### Declined for Inclusion

* EIP-9999

## Rationale

Mentions EIP-1559 for context.
`;

describe("EIP parsing", () => {
    it("reads front matter, stripping quotes", () => {
        expect(parseFrontMatter(meta)).toMatchObject({ eip: '7773', title: 'Hardfork Meta - Glamsterdam', status: 'Draft', type: 'Meta' });
        expect(parseFrontMatter('no front matter')).toEqual({});
    });

    it("builds EIP info, linking ERCs to their own site", () => {
        expect(toEipInfo(1559, eip(1559, 'Fee market change for ETH 1.0 chain', 'Final'))).toEqual({
            number: 1559, title: 'Fee market change for ETH 1.0 chain', status: 'Final', type: 'Standards Track', category: 'Core', created: '2024-01-02', url: 'https://eips.ethereum.org/EIPS/eip-1559'
        });
        expect(toEipInfo(20, eip(20, 'Token Standard', 'Final', 'ERC'))!.url).toBe('https://ercs.ethereum.org/ERCS/erc-20');
        expect(toEipInfo(1, 'garbage')).toBeNull();
    });

    it("groups an upgrade's EIPs by section and ignores other sections", () => {
        expect(parseUpgradeSections(meta, 7773)).toEqual([
            { heading: 'Scheduled for Inclusion', numbers: [7732, 7928] },
            { heading: 'Considered for Inclusion', numbers: [7805, 7928] },
            { heading: 'Declined for Inclusion', numbers: [9999] }
        ]);
    });
});

describe("real meta EIPs (copies of ethereum/EIPs files)", () => {
    const fixture = (name: string) => readFileSync(new URL(`../test/fixtures/${name}`, import.meta.url), 'utf8');

    it("reads Fusaka's nested 'Included EIPs' sections and its mainnet activation, skipping the BPO tables", () => {
        const fusaka = fixture('eip-7607.md');
        const sections = parseUpgradeSections(fusaka, 7607);
        expect(sections.map(s => s.heading)).toEqual(['Included EIPs: Core EIPs', 'Included EIPs: Other EIPs']);
        expect(sections[0].numbers).toContain(7594);
        expect(sections[1].numbers).toEqual([7892, 7642, 7910, 7935]);
        expect(parseMainnetActivation(fusaka)).toBe('2025-12-03 21:49:11');
    });

    it("reads Glamsterdam's scheduled EIPs", () => {
        const glamsterdam = fixture('eip-7773.md');
        const sections = parseUpgradeSections(glamsterdam, 7773);
        expect(sections.length).toBeGreaterThan(0);
        expect(sections[0].heading).toMatch(/Scheduled for Inclusion/);
        expect(sections[0].numbers).toContain(7732);
        expect(parseFrontMatter(glamsterdam).title).toBe('Hardfork Meta - Glamsterdam');
    });
});

describe("fetching from GitHub", () => {
    it("falls back to the ERCs repo for application standards", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => String(input).includes('/ERCs/') ? text(eip(20, 'Token Standard', 'Final', 'ERC')) : text('404: Not Found', 404));
        expect(await fetchEip(20)).toMatchObject({ number: 20, status: 'Final', category: 'ERC' });
        expect(String(fetchMock.mock.calls.at(-1)![0])).toBe('https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-20.md');
    });

    it("loads standards and the upgrade tracker", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            const n = Number(url.match(/(?:eip|erc)-(\d+)\.md$/)![1]);
            if (url.includes('/ERCs/')) return text('nope', 404);
            if (n === 7773) return text(meta);
            if (n === 7607) return text('', 500);
            if (n === 9999) return text('nope', 404);
            return text(eip(n, `Title ${n}`, n === 7732 ? 'Review' : 'Draft'));
        });
        const data = await getEipData([1559]);
        expect(data.standards[1559]).toMatchObject({ status: 'Draft' });
        expect(data.upgrades).toHaveLength(1);
        const [glamsterdam] = data.upgrades;
        expect(glamsterdam.name).toBe('Glamsterdam');
        expect(glamsterdam.groups[0].eips.map(e => [e.number, e.status])).toEqual([[7732, 'Review'], [7928, 'Draft']]);
        // An EIP that can't be loaded still appears, marked unknown
        expect(glamsterdam.groups[2].eips[0]).toMatchObject({ number: 9999, status: 'Unknown' });
    });
});
