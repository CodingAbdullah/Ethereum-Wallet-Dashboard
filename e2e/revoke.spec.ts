import { erc20Abi, type Address } from "viem";
import type { Page } from "@playwright/test";
import { test, expect, connectWallet, confirmInWallet, preview, state } from "./fixtures";
import { ACCOUNT, SPENDER_1, SPENDER_2, readClient, type ChainFixture } from "./chain";

// Moralis can't index a local chain, so /api/approvals is answered from live on-chain allowances.
// Everything else (simulation, signing, mining) is real.
const pairs = (c: ChainFixture) => [[c.usdx, 'USDX', SPENDER_1], [c.daix, 'DAIX', SPENDER_2], [c.usdx, 'USDX', SPENDER_2]] as const;
const allowances = (c: ChainFixture) => Promise.all(pairs(c).map(([token, , spender]) =>
    readClient(c.rpc).readContract({ address: token as Address, abi: erc20Abi, functionName: 'allowance', args: [ACCOUNT, spender] })));

async function serveApprovals(page: Page) {
    const chains = state();
    await page.route('**/api/approvals', async route => {
        const { network } = route.request().postDataJSON() as { network: 'eth' | 'base' };
        const chain = chains[network];
        const values = await allowances(chain);
        const approvals = pairs(chain).map(([token, symbol, spender], i) => ({
            tokenAddress: token.toLowerCase(), tokenSymbol: symbol, tokenName: symbol, tokenLogo: null, spender, spenderLabel: null,
            amount: values[i] > BigInt(10) ** BigInt(60) ? 'Unlimited' : values[i].toString(), unlimited: values[i] > BigInt(10) ** BigInt(60),
            usdAtRisk: null, approvedAt: null, transactionHash: null
        })).filter((_, i) => values[i] > BigInt(0));
        await route.fulfill({ json: { approvals, verified: true } });
    });
}

test.describe('revoke approvals', () => {
    test('cancel, revoke one, then revoke the rest together on Ethereum', async ({ page, wallet }) => {
        const { eth } = state();
        await serveApprovals(page);
        await page.goto('/approvals');
        await connectWallet(page);
        await expect(page.getByText('3 approvals, riskiest first')).toBeVisible();

        // Cancelling in the wallet goes back to the preview and changes nothing
        await page.getByRole('button', { name: 'Revoke', exact: true }).first().click();
        await expect(preview(page).getByText('Simulation succeeded')).toBeVisible({ timeout: 20_000 });
        await expect(preview(page).getByText('No balance changes for your wallet.')).toBeVisible();
        await wallet.rejectNext();
        await page.getByRole('button', { name: 'Confirm in wallet' }).click();
        await expect(page.getByRole('button', { name: 'Confirm in wallet' })).toBeVisible();
        expect((await allowances(eth))[0]).toBeGreaterThan(BigInt(0));

        await confirmInWallet(page);
        await expect(page.getByText('2 approvals, riskiest first')).toBeVisible();
        expect((await allowances(eth))[0]).toBe(BigInt(0));
        await page.getByRole('button', { name: 'Close' }).click();

        for (const box of await page.getByRole('checkbox').all()) await box.check();
        await page.getByRole('button', { name: 'Revoke selected (2)' }).click();
        await confirmInWallet(page, 2);
        await expect(page.getByText('No token approvals on Ethereum')).toBeVisible();
        expect(await allowances(eth)).toEqual([BigInt(0), BigInt(0), BigInt(0)]);
    });

    test('revokes on Base, switching the wallet to Base first @mobile', async ({ page, wallet }) => {
        const { base } = state();
        await serveApprovals(page);
        await page.goto('/approvals');
        await connectWallet(page);
        await page.getByLabel('Network').selectOption('base');
        await expect(page.getByText(/approvals?, riskiest first/)).toBeVisible();
        const before = (await allowances(base)).filter(v => v > BigInt(0)).length;
        await page.getByRole('button', { name: 'Revoke', exact: true }).first().click();
        await confirmInWallet(page);
        expect((await allowances(base)).filter(v => v > BigInt(0)).length).toBe(before - 1);
        expect(await wallet.calls()).toContain('wallet_switchEthereumChain');
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    });
});
