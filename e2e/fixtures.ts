import fs from "node:fs";
import { test as base, expect, type Page } from "@playwright/test";
import { ACCOUNT, type ChainFixture } from "./chain";
import { STATE_FILE } from "./global-setup";

// The test wallet: a browser wallet announced through EIP-6963 whose requests go to the local chains.
// Transactions are signed by anvil (account 0 is unlocked), so no private key is ever in the page.
// It remembers its connection for the session, like a real wallet, and can be told to reject the next request.

export interface State { eth: ChainFixture; base: ChainFixture }
export const state = (): State => JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

// Installed in every test (auto), whether or not the test uses it directly
export const test = base.extend<{ wallet: { rejectNext: () => Promise<void>; calls: () => Promise<string[]> } }>({
    wallet: [async ({ context }, use) => {
        const { eth, base: baseChain } = state();
        const rpcs: Record<number, string> = { 1: eth.rpc, 8453: baseChain.rpc };
        await context.exposeBinding('__testRpc', async (_source, chainId: number, method: string, params: unknown[]) => {
            const response = await fetch(rpcs[chainId], { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
            const body = await response.json();
            return body.error ? { error: body.error } : { result: body.result };
        });
        await context.addInitScript(({ address }) => {
            const w = window as unknown as Record<string, unknown>;
            const listeners: Record<string, ((v: unknown) => void)[]> = {};
            let authorized = sessionStorage.getItem('__wallet_authorized') === '1';
            let chainId = Number(sessionStorage.getItem('__wallet_chain') || 1);
            const log: string[] = (w.__walletLog = []) as string[];
            const emit = (event: string, value: unknown) => (listeners[event] ?? []).forEach(f => f(value));
            const provider = {
                async request({ method, params }: { method: string; params?: unknown[] }) {
                    log.push(method);
                    switch (method) {
                        case 'eth_requestAccounts': authorized = true; sessionStorage.setItem('__wallet_authorized', '1'); return [address];
                        case 'eth_accounts': return authorized ? [address] : [];
                        case 'eth_chainId': return '0x' + chainId.toString(16);
                        case 'wallet_requestPermissions': case 'wallet_getPermissions': return [{ parentCapability: 'eth_accounts' }];
                        case 'wallet_revokePermissions': return null;
                        case 'wallet_switchEthereumChain': {
                            const next = parseInt((params![0] as { chainId: string }).chainId, 16);
                            if (next !== 1 && next !== 8453) throw Object.assign(new Error('Unrecognized chain'), { code: 4902 });
                            chainId = next;
                            sessionStorage.setItem('__wallet_chain', String(next));
                            emit('chainChanged', '0x' + next.toString(16));
                            return null;
                        }
                        default: {
                            if (method === 'eth_sendTransaction' && w.__rejectNext) {
                                w.__rejectNext = false;
                                throw Object.assign(new Error('User rejected the request.'), { code: 4001 });
                            }
                            const { result, error } = await (w.__testRpc as (c: number, m: string, p: unknown[]) => Promise<{ result?: unknown; error?: { message: string; code: number } }>)(chainId, method, params ?? []);
                            if (error) throw Object.assign(new Error(error.message), { code: error.code });
                            return result;
                        }
                    }
                },
                on(event: string, f: (v: unknown) => void) { (listeners[event] ??= []).push(f); },
                removeListener(event: string, f: (v: unknown) => void) { listeners[event] = (listeners[event] ?? []).filter(x => x !== f); }
            };
            const info = { uuid: '00000000-0000-4000-8000-000000000000', name: 'Test Wallet', icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>', rdns: 'dev.test.wallet' };
            // Like real extensions, also expose it as window.ethereum (the generic "Browser Wallet" option uses it)
            w.ethereum = provider;
            const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) }));
            window.addEventListener('eip6963:requestProvider', announce);
            announce();
        }, { address: ACCOUNT });
        await use({
            rejectNext: async () => { await context.pages()[0]?.evaluate(() => { (window as unknown as Record<string, unknown>).__rejectNext = true; }); },
            calls: async () => (await context.pages()[0]?.evaluate(() => (window as unknown as Record<string, string[]>).__walletLog)) ?? []
        });
    }, { auto: true }]
});

// Connects the test wallet from the navbar (or the in-page button on small screens)
export async function connectWallet(page: Page) {
    const navButton = page.locator('nav button:visible', { hasText: 'Connect Wallet' }).first();
    if (await navButton.isVisible()) await navButton.click();
    else await page.getByRole('button', { name: /Connect Wallet/ }).last().click();
    // Announced wallets (EIP-6963) can arrive after the menu opens; the generic entry uses the same wallet
    await page.getByRole('menuitem', { name: 'Test Wallet' }).or(page.getByRole('menuitem', { name: 'Browser Wallet' })).first().click();
    await expect(page.locator('nav button:visible', { hasText: '0xf39F' }).first()).toBeVisible();
}

// The open transaction preview, and confirming it in the wallet
export const preview = (page: Page) => page.locator('section[aria-label="Transaction preview"]');
export async function confirmInWallet(page: Page, transactions = 1) {
    await expect(preview(page).getByText('Simulation succeeded')).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Confirm in wallet' }).click();
    await expect(page.getByText(transactions > 1 ? 'All transactions were confirmed' : 'The transaction was confirmed')).toBeVisible({ timeout: 40_000 });
}

export { expect };
