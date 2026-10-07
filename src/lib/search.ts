import { isAddress, isHash } from "viem";
import { normalize } from "viem/ens";
import { SITE_PAGES } from "@/app/utils/constants/SitePages";

// Global search (Cmd+K): works out what was typed and suggests where to go.
// ENS names need an on-chain lookup, so they come back as a 'resolve-ens' action.

export interface Suggestion {
    id: string;
    label: string;
    hint: string;
    href?: string;
    resolveEns?: string;
}

const MAX_RESULTS = 8;

function validEnsName(query: string): string | null {
    if (!/\.eth$/i.test(query)) return null;
    try { return normalize(query); }
    catch { return null; }
}

export function searchSuggestions(raw: string): Suggestion[] {
    const query = raw.trim();
    if (!query) return [];
    const results: Suggestion[] = [];

    if (isAddress(query, { strict: false })) {
        results.push(
            { id: 'address', label: 'Open address', hint: query, href: `/address/${query}` },
            { id: 'wallet', label: 'Wallet transaction history', hint: query, href: `/wallet-activity/${query}` },
            { id: 'token', label: 'Open as a token', hint: 'ERC20 contract', href: `/token/${query}` }
        );
    }
    else if (isHash(query)) {
        results.push({ id: 'tx', label: 'Open transaction', hint: query, href: `/tx/${query}` });
    }
    else if (/^\d{1,12}$/.test(query.replace(/,/g, ''))) {
        const n = query.replace(/,/g, '');
        results.push({ id: 'block', label: `Open block ${Number(n).toLocaleString('en-US')}`, hint: 'Ethereum', href: `/block/${n}` });
    }
    else {
        const ens = validEnsName(query);
        if (ens) {
            results.push(
                { id: 'ens', label: `Go to ${ens}`, hint: 'Resolve ENS name', resolveEns: ens },
                { id: 'ens-lookup', label: 'ENS lookup', hint: 'Owner, records and history', href: '/ens-lookup/ens-to-address-lookup' }
            );
        }
    }

    // Pages whose name or keywords match every word typed
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    for (const group of SITE_PAGES) {
        for (const page of group.pages) {
            const haystack = (page.name + ' ' + (page.keywords ?? '') + ' ' + group.name).toLowerCase();
            if (words.every(w => haystack.includes(w))) results.push({ id: 'page:' + page.href, label: page.name, hint: group.name, href: page.href });
        }
    }

    // A word that could be a coin ("bitcoin", "lido-dao") gets a price link
    if (/^[a-z][a-z0-9-]{1,40}$/i.test(query) && !results.some(r => r.id === 'tx' || r.id === 'address')) {
        results.push({ id: 'coin', label: `Price of ${query}`, hint: 'Coin page (CoinGecko ID)', href: `/prices/${query.toLowerCase()}` });
    }

    return results.slice(0, MAX_RESULTS);
}
