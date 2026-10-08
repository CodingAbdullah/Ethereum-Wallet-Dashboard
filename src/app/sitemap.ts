import type { MetadataRoute } from "next";
import { SITE_PAGES } from "./utils/constants/SitePages";

export const SITE_URL = 'https://ethereumdashboard.dev';

// Every public page from the site map used by the navbar and search (src/app/utils/constants/SitePages.ts).
// Per-user pages (/me, /alerts) and on-demand pages (/tx, /address, ...) are left to links.
const PRIVATE = new Set(['/me', '/alerts']);
const LIVE = new Set(['/', '/prices', '/gas-tracker', '/block/latest', '/market-insights', '/dex-pools', '/derivatives', '/mev']);

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = ['/', ...SITE_PAGES.flatMap(group => group.pages.map(page => page.href))]
        .filter((href, i, all) => href.startsWith('/') && !PRIVATE.has(href) && all.indexOf(href) === i);
    const now = new Date();
    return paths.map(path => ({
        url: SITE_URL + (path === '/' ? '' : path),
        lastModified: now,
        changeFrequency: LIVE.has(path) ? 'hourly' : 'daily',
        priority: path === '/' ? 1 : 0.7
    }));
}
