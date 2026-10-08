import { erc20Abi, formatEther, formatUnits } from "viem";
import { test, expect, connectWallet, confirmInWallet, preview, state } from "./fixtures";
import { RECIPIENT, readClient } from "./chain";

test.describe('send, wrap and contract calls', () => {
    test('sends ETH and a token, and warns about sending to a token contract', async ({ page }) => {
        const { eth } = state();
        const client = readClient(eth.rpc);
        await page.goto('/send');
        await connectWallet(page);

        const ethBefore = Number(formatEther(await client.getBalance({ address: RECIPIENT })));
        await page.getByLabel('Recipient').fill(RECIPIENT);
        await page.getByLabel('Amount').fill('1.5');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(preview(page).getByText('−1.5 ETH')).toBeVisible({ timeout: 20_000 });
        await confirmInWallet(page);
        expect(Number(formatEther(await client.getBalance({ address: RECIPIENT }))) - ethBefore).toBeCloseTo(1.5, 6);
        await page.getByRole('button', { name: 'Close' }).click();

        await page.getByLabel('Asset').selectOption('other');
        await page.getByPlaceholder('0x…', { exact: true }).first().fill(eth.usdx);
        await expect(page.getByText(/Balance: .* USDX/)).toBeVisible({ timeout: 15_000 });
        await page.getByLabel('Amount').fill('250');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(preview(page).getByText('−250 USDX')).toBeVisible({ timeout: 20_000 });
        await confirmInWallet(page);
        expect(formatUnits(await client.readContract({ address: eth.usdx, abi: erc20Abi, functionName: 'balanceOf', args: [RECIPIENT] }), 6)).toBe('250');
        await page.getByRole('button', { name: 'Close' }).click();

        await page.getByLabel('Recipient').fill(eth.usdx);
        await expect(page.getByText('This is a contract')).toBeVisible({ timeout: 15_000 });
        await page.getByLabel('Amount').fill('1');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(page.getByText('You are sending tokens to the token contract itself')).toBeVisible({ timeout: 20_000 });
    });

    test('wraps and unwraps ETH, and blocks calls to missing contracts', async ({ page }) => {
        await page.goto('/stake');
        await connectWallet(page);
        await page.getByRole('tab', { name: 'Wrap', exact: true }).click();
        await page.getByLabel('Amount').fill('2');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(preview(page).getByText('+2 WETH')).toBeVisible({ timeout: 20_000 });
        await confirmInWallet(page);
        await page.getByRole('button', { name: 'Close' }).click();

        await page.getByRole('tab', { name: 'Unwrap' }).click();
        await page.getByLabel('Amount').fill('0.5');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(preview(page).getByText('+0.5 ETH')).toBeVisible({ timeout: 20_000 });
        await confirmInWallet(page);
        await page.getByRole('button', { name: 'Close' }).click();

        // Lido isn't deployed on the blank test chain: the preview must refuse instead of "succeeding"
        await page.getByRole('tab', { name: 'Stake (Lido)' }).click();
        await page.getByLabel('Amount').fill('1');
        await page.getByRole('button', { name: 'Review' }).click();
        await expect(preview(page).getByText(/There is no contract at/)).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole('button', { name: 'Confirm in wallet' })).toBeDisabled();
    });

    test('reads and writes a contract from the contract explorer', async ({ page }) => {
        const { eth } = state();
        const fs = await import('node:fs');
        const { TestToken } = JSON.parse(fs.readFileSync(new URL('./contracts/artifacts.json', import.meta.url), 'utf8'));
        // Etherscan and Sourcify can't see a local chain: serve the verified ABI
        await page.route('**/api/contract/abi', route => route.fulfill({ json: { name: 'TestToken', functions: TestToken.abi.filter((x: { type: string }) => x.type === 'function'), source: 'sourcify', implementation: null } }));
        await page.goto(`/contract?address=${eth.usdx}&chain=eth`);
        await connectWallet(page);
        await page.getByRole('button', { name: 'Load' }).click();
        await page.locator('summary', { hasText: /^balanceOf\(/ }).click();
        await page.getByLabel('balanceOf 0').fill(RECIPIENT);
        await page.getByRole('button', { name: 'Query' }).click();
        await expect(page.locator('pre').first()).toHaveText(/^\d+$/);

        await page.getByRole('button', { name: /^Write/ }).click();
        await page.locator('summary', { hasText: /^transfer\(/ }).click();
        await page.getByLabel('transfer to').fill(RECIPIENT);
        await page.getByLabel('transfer value').fill('5000000');
        await page.getByRole('button', { name: 'Review transaction' }).click();
        await expect(preview(page).getByText('−5 USDX')).toBeVisible({ timeout: 20_000 });
        await confirmInWallet(page);
    });
});
