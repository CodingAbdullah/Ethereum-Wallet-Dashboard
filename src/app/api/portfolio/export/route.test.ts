import { describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const SECRET = 'a'.repeat(32);
const USER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
let token = '';
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => token ? { name: SESSION_COOKIE, value: token } : undefined }) }));
vi.mock("@/lib/db", () => ({ getDb: () => ({}) }));
vi.mock("@/lib/accounts", () => ({ listWatchedWallets: async () => [] }));
vi.mock("@/lib/portfolio", () => ({
    getPortfolio: async () => ({
        wallets: [
            {
                wallet: { id: 1, address: USER, chain: 'eth', label: 'Main, wallet' },
                tokens: { data: [{ symbol: 'ETH', name: 'Ether', tokenAddress: 'native', balance: 1.5, usdPrice: 3000, usdValue: 4500 }, { symbol: '=EVIL', name: 'Scam', tokenAddress: '0xbad', balance: 1, usdPrice: null, usdValue: 0 }] }
            },
            { wallet: { id: 2, address: USER, chain: 'sepolia', label: null }, tokens: { error: 'Moralis is unavailable right now' } }
        ]
    })
}));

describe("/api/portfolio/export", () => {
    it("requires sign-in", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        token = '';
        const { GET } = await import("./route");
        expect((await GET()).status).toBe(401);
    });

    it("downloads holdings as CSV, keeping wallets that failed to load", async () => {
        vi.stubEnv('AUTH_SECRET', SECRET);
        token = await createSessionToken({ address: USER, chainId: 1 }, SECRET);
        const { GET } = await import("./route");
        const response = await GET();

        expect(response.headers.get('content-type')).toContain('text/csv');
        expect(response.headers.get('content-disposition')).toMatch(/attachment; filename="portfolio-\d{4}-\d{2}-\d{2}\.csv"/);
        const lines = (await response.text()).trim().split('\r\n');
        expect(lines[0]).toBe('wallet,label,network,symbol,name,token_address,balance,usd_price,usd_value');
        expect(lines[1]).toBe(`${USER},"Main, wallet",eth,ETH,Ether,native,1.5,3000,4500.00`);
        expect(lines[2]).toContain("'=EVIL");
        expect(lines[3]).toBe(`${USER},,sepolia,,Holdings unavailable: Moralis is unavailable right now,,,,`);
    });
});
