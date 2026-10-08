import { test, expect } from "./fixtures";

// The installable app: manifest and icons are served, the service worker registers, and a page load
// without a connection shows the offline page instead of the browser's error.
test.describe('pwa', () => {
    test.use({ serviceWorkers: 'allow' });

    test('serves an installable manifest', async ({ request }) => {
        const manifest = await (await request.get('/manifest.webmanifest')).json();
        expect(manifest).toMatchObject({ name: 'Ethereum Dashboard', display: 'standalone', start_url: '/' });
        for (const icon of manifest.icons) expect((await request.get(icon.src)).headers()['content-type']).toBe('image/png');
    });

    test('shows the offline page when there is no connection', async ({ page, context }) => {
        await page.goto('/about');
        await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
        // Registered in production builds, then takes control of the page
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.reload();
        await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

        await context.setOffline(true);
        await context.route('**/gas-tracker', route => route.abort('internetdisconnected'));
        await page.goto('/gas-tracker');
        await expect(page.getByRole('heading', { name: "You're offline" })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    });
});
