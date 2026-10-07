import { unstable_cache } from "next/cache";
import { providerFetch } from "./providers/http";

// Live EIP/ERC data from GitHub. Since 2023 ERCs (application standards) live in ethereum/ERCs and
// core EIPs in ethereum/EIPs; each file starts with front matter (eip, title, status, category, ...).
// Network upgrades are tracked by "meta" EIPs that list the EIPs scheduled or considered for them.

export interface EipInfo {
    number: number;
    title: string;
    status: string;
    type: string | null;
    category: string | null;
    created: string | null;
    url: string;
}

export interface UpgradeGroup { heading: string; eips: EipInfo[] }
export interface UpgradeInfo { name: string; meta: EipInfo; groups: UpgradeGroup[]; mainnetActivation: string | null }

// Upgrade meta EIPs, newest first
export const UPGRADES = [
    { name: 'Glamsterdam', eip: 7773 },
    { name: 'Fusaka', eip: 7607 }
];

const RAW = 'https://raw.githubusercontent.com/ethereum';

export function parseFrontMatter(markdown: string): Record<string, string> {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fields: Record<string, string> = {};
    for (const line of (match?.[1] ?? '').split(/\r?\n/)) {
        const i = line.indexOf(':');
        if (i > 0) fields[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
    return fields;
}

export function toEipInfo(number: number, markdown: string): EipInfo | null {
    const f = parseFrontMatter(markdown);
    if (!f.title || !f.status) return null;
    const isErc = f.category === 'ERC';
    return {
        number,
        title: f.title,
        status: f.status,
        type: f.type ?? null,
        category: f.category ?? null,
        created: f.created ?? null,
        url: isErc ? `https://ercs.ethereum.org/ERCS/erc-${number}` : `https://eips.ethereum.org/EIPS/eip-${number}`
    };
}

const UPGRADE_SECTION = /inclu|activat|schedul|consider|declin|propos/i;

// Groups the EIP numbers a meta EIP mentions under the headings they appear in, e.g.
// "Scheduled for Inclusion" or, when nested, "Included EIPs: Core EIPs". Only sections about the
// upgrade's contents are kept (not Abstract, Rationale, Blob Parameter Only Forks, ...).
export function parseUpgradeSections(markdown: string, metaNumber: number): { heading: string; numbers: number[] }[] {
    const body = markdown.replace(/^---[\s\S]*?\n---/, '');
    const groups: { heading: string; numbers: number[]; relevant: boolean }[] = [];
    const stack: { level: number; text: string }[] = [];
    let current: (typeof groups)[number] | null = null;
    for (const line of body.split(/\r?\n/)) {
        const heading = line.match(/^(#{2,4})\s+(.+?)\s*$/);
        if (heading) {
            const level = heading[1].length;
            const text = heading[2].replace(/[`*]/g, '');
            while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
            const parent = stack.filter(h => h.level > 2).map(h => h.text);
            stack.push({ level, text });
            current = { heading: [...parent, text].join(': '), numbers: [], relevant: stack.some(h => UPGRADE_SECTION.test(h.text)) };
            groups.push(current);
            continue;
        }
        if (!current || line.trim().startsWith('|')) continue;      // skip tables (activation schedules)
        for (const m of line.matchAll(/EIP-(\d{1,5})/gi)) {
            const n = Number(m[1]);
            if (n !== metaNumber && !current.numbers.includes(n)) current.numbers.push(n);
        }
    }
    return groups.filter(g => g.relevant && g.numbers.length > 0).map(({ heading, numbers }) => ({ heading, numbers }));
}

// The mainnet row of the meta EIP's activation table, e.g. "2025-12-03 21:49:11"
export function parseMainnetActivation(markdown: string): string | null {
    const activation = markdown.split(/\n#{2,4}\s+/).find(section => /^Activation\b/i.test(section)) ?? '';
    const row = activation.split(/\r?\n/).find(line => /^\|\s*Mainnet\s*\|/i.test(line));
    const date = row?.match(/\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?::\d{2})?)?/);
    return date ? date[0] : null;
}

const fetchText = (url: string) => providerFetch<string>('GitHub', url, { revalidate: 86400, headers: { accept: 'text/plain' }, timeoutMs: 15000, text: true });

// Core EIPs are in ethereum/EIPs; ERCs moved to ethereum/ERCs
export async function fetchEip(number: number): Promise<EipInfo | null> {
    for (const url of [`${RAW}/EIPs/master/EIPS/eip-${number}.md`, `${RAW}/ERCs/master/ERCS/erc-${number}.md`]) {
        try {
            const info = toEipInfo(number, await fetchText(url));
            if (info) return info;
        }
        catch { /* try the other repo */ }
    }
    return null;
}

export const MAX_UPGRADE_EIPS = 40;

async function fetchUpgrade(upgrade: { name: string; eip: number }): Promise<UpgradeInfo | null> {
    const markdown = await fetchText(`${RAW}/EIPs/master/EIPS/eip-${upgrade.eip}.md`);
    const meta = toEipInfo(upgrade.eip, markdown);
    if (!meta) return null;
    const sections = parseUpgradeSections(markdown, upgrade.eip);
    const numbers = [...new Set(sections.flatMap(s => s.numbers))].slice(0, MAX_UPGRADE_EIPS);
    const infos = new Map((await Promise.all(numbers.map(async n => [n, await fetchEip(n)] as const))).filter(([, info]) => info) as [number, EipInfo][]);
    return {
        name: upgrade.name,
        meta,
        mainnetActivation: parseMainnetActivation(markdown),
        groups: sections.map(s => ({ heading: s.heading, eips: s.numbers.map(n => infos.get(n) ?? { number: n, title: `EIP-${n}`, status: 'Unknown', type: null, category: null, created: null, url: `https://eips.ethereum.org/EIPS/eip-${n}` }) }))
    };
}

export const getEipData = unstable_cache(async (standards: number[]) => {
    const [statuses, upgrades] = await Promise.all([
        Promise.all(standards.map(fetchEip)),
        Promise.all(UPGRADES.map(u => fetchUpgrade(u).catch(() => null)))
    ]);
    return {
        standards: Object.fromEntries(statuses.filter((s): s is EipInfo => !!s).map(s => [s.number, s])),
        upgrades: upgrades.filter((u): u is UpgradeInfo => !!u)
    };
}, ['eips'], { revalidate: 86400 });
