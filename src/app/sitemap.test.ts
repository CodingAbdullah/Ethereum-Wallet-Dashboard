import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";

describe("sitemap and robots", () => {
    it("lists each public page once, without per-user pages", () => {
        const urls = sitemap().map(e => e.url);
        expect(urls[0]).toBe('https://ethereumdashboard.dev');
        expect(new Set(urls).size).toBe(urls.length);
        expect(urls).toContain('https://ethereumdashboard.dev/swap');
        expect(urls).toContain('https://ethereumdashboard.dev/l2/base');
        expect(urls.some(u => /\/(me|alerts)$/.test(u))).toBe(false);
    });

    it("keeps crawlers out of the API and account pages", () => {
        const rules = robots().rules as { disallow: string[] };
        expect(rules.disallow).toEqual(expect.arrayContaining(['/api/', '/me', '/alerts']));
        expect(robots().sitemap).toBe('https://ethereumdashboard.dev/sitemap.xml');
    });
});
