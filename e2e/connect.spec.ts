import { test, expect, connectWallet } from "./fixtures";

test.describe('connect', () => {
    test('connects a browser wallet and stays connected after a reload', async ({ page, wallet }) => {
        await page.goto('/');
        await connectWallet(page);
        const account = page.locator('nav button:visible', { hasText: '0xf39F' }).first();
        await expect(account).toBeVisible();
        await page.reload();
        await expect(account).toBeVisible();
        expect(await wallet.calls()).toContain('eth_accounts');
    });
});
