import { erc20Abi, formatUnits } from "viem";
import type { Page } from "@playwright/test";
import { test, expect, connectWallet, confirmInWallet, preview, state } from "./fixtures";
import { ACCOUNT, readClient, type ChainFixture } from "./chain";

// Swaps against the official Uniswap v3 contracts on the local chains (QuoterV2 and SwapRouter02
// at their real addresses, a USDX/WETH pool with liquidity).
const usdxBalance = async (c: ChainFixture) => Number(formatUnits(await readClient(c.rpc).readContract({ address: c.usdx, abi: erc20Abi, functionName: 'balanceOf', args: [ACCOUNT] }), 6));

async function pick(page: Page, side: 'From' | 'To', token: string | 'native') {
    if (token === 'native') return page.getByLabel(side, { exact: true }).selectOption('native');
    await page.getByLabel(side, { exact: true }).selectOption('other');
    await page.getByLabel(`${side} token address`).fill(token);
}

// The "You get about N USDX" amount from the preview, which must match what arrives
const previewedGain = async (page: Page, symbol: string) => {
    const text = await preview(page).innerText();
    return Number(text.match(new RegExp(`\\+([\\d,.]+) ${symbol}`))![1].replace(/,/g, ''));
};

test.describe('swap', () => {
    test('ETH to a token and back on Ethereum, with an exact-amount approval', async ({ page }) => {
        const { eth } = state();
        await page.goto('/swap');
        await connectWallet(page);

        await pick(page, 'From', 'native');
        await pick(page, 'To', eth.usdx);
        await page.getByLabel('Amount').fill('1');
        await expect(page.getByText('You get about')).toBeVisible({ timeout: 20_000 });
        await page.getByRole('button', { name: 'Review swap' }).click();
        await expect(preview(page).getByText('Simulation succeeded')).toBeVisible({ timeout: 20_000 });
        const before = await usdxBalance(eth);
        const gain = await previewedGain(page, 'USDX');
        expect(gain).toBeGreaterThan(2_800);         // ~3,000 per ETH minus fee and price impact
        await confirmInWallet(page);
        expect(await usdxBalance(eth) - before).toBeCloseTo(gain, 4);
        await page.getByRole('button', { name: 'Close' }).click();

        await pick(page, 'From', eth.usdx);
        await pick(page, 'To', 'native');
        await page.getByLabel('Amount').fill('1000');
        await expect(page.getByText('You get about')).toBeVisible({ timeout: 20_000 });
        await page.getByRole('button', { name: 'Review swap' }).click();
        await expect(preview(page).getByText('2 transactions, signed one after another')).toBeVisible({ timeout: 20_000 });
        await expect(preview(page).getByText(/let Uniswap use exactly 1,000 USDX/)).toBeVisible();
        await confirmInWallet(page, 2);
    });

    test('swaps on Base and explains pairs with no pool @mobile', async ({ page }) => {
        const { base } = state();
        await page.goto('/swap');
        await connectWallet(page);
        await page.getByLabel('Network').selectOption('base');
        await pick(page, 'From', 'native');
        await pick(page, 'To', base.usdx);
        await page.getByLabel('Amount').fill('0.5');
        await expect(page.getByText('You get about')).toBeVisible({ timeout: 20_000 });
        await page.getByRole('button', { name: 'Review swap' }).click();
        await expect(preview(page).getByText('Simulation succeeded')).toBeVisible({ timeout: 20_000 });
        const before = await usdxBalance(base);
        const gain = await previewedGain(page, 'USDX');
        await confirmInWallet(page);
        expect(await usdxBalance(base) - before).toBeCloseTo(gain, 4);
        await page.getByRole('button', { name: 'Close' }).click();

        // The amount is cleared after a swap; there is no DAIX pool, so the quote explains that
        await pick(page, 'To', base.daix);
        await page.getByLabel('Amount').fill('1');
        await expect(page.getByText('No Uniswap pool can fill this swap')).toBeVisible({ timeout: 20_000 });
    });
});
