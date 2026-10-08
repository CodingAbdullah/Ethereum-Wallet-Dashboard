import { test, expect, state } from "./fixtures";
import { ACCOUNT } from "./chain";

// Looking things up: global search to a transaction, then the transaction, address and block pages
test.describe('lookup', () => {
    test('search finds a transaction and the explorer pages render it @mobile', async ({ page }) => {
        const { eth } = state();
        await page.goto('/');
        // The home search box opens the global search palette
        await page.getByRole('button', { name: /Search an address, ENS name, transaction/ }).click();
        await page.getByPlaceholder(/Address, ENS name, tx hash/).fill(eth.approvalTx);
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(new RegExp(`/tx/${eth.approvalTx}`));
        await expect(page.getByRole('heading', { name: 'Transaction' })).toBeVisible();
        await expect(page.getByText('Success')).toBeVisible();
        // The approval is decoded from its logs
        await expect(page.getByText(/Approval|USDX/).first()).toBeVisible();

        await page.goto(`/address/${ACCOUNT}`);
        await expect(page.getByRole('heading', { name: 'Address' })).toBeVisible();
        await expect(page.getByText(/ETH/).first()).toBeVisible();

        await page.goto('/block/latest');
        await expect(page.getByRole('heading', { name: /Block/ })).toBeVisible();
    });
});
