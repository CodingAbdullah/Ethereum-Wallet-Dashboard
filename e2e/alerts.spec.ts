import { test, expect } from "./fixtures";

// Alerts need a database and a signed-in session, so the alerts API is stubbed with an in-memory
// version; this checks the page flow: add a channel, create an alert, pause it, see history.
test.describe('alerts', () => {
    test('adds a channel and creates, pauses and lists an alert @mobile', async ({ page }) => {
        const channels: Record<string, unknown>[] = [];
        const subs: Record<string, unknown>[] = [];
        await page.route('**/api/auth/session', r => r.fulfill({ json: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', authEnabled: true, accountsEnabled: true } }));
        await page.route('**/api/alerts/events', r => r.fulfill({ json: [{ id: 1, title: 'Gas is 3.10 gwei', message: 'The base fee dropped to 3.10 gwei.', url: null, delivered: true, deliveryError: null, createdAt: '2026-10-07T07:00:00Z' }] }));
        await page.route('**/api/alerts/channels', async r => {
            if (r.request().method() === 'GET') return r.fulfill({ json: channels });
            const body = r.request().postDataJSON();
            channels.push({ id: channels.length + 1, kind: body.kind, label: null, verified: true, display: 'Discord webhook …secret' });
            return r.fulfill({ status: 201, json: { channel: channels.at(-1) } });
        });
        await page.route('**/api/alerts/subscriptions', async r => {
            const method = r.request().method();
            if (method === 'GET') return r.fulfill({ json: subs });
            const body = r.request().postDataJSON();
            if (method === 'POST') {
                expect(body).toMatchObject({ kind: 'gas_below', params: { maxGwei: 5 } });
                subs.push({ id: 1, kind: 'gas_below', title: 'Gas below a price', summary: 'Base fee at or under 5 gwei', channelId: body.channelId, enabled: true, lastTriggeredAt: null });
                return r.fulfill({ status: 201, json: subs[0] });
            }
            if (method === 'PATCH') subs[0].enabled = body.enabled;
            return r.fulfill({ json: {} });
        });

        await page.goto('/alerts?new=gas_below');
        await page.getByLabel('Channel').selectOption('discord');
        await page.getByPlaceholder('https://discord.com/api/webhooks/…').fill('https://discord.com/api/webhooks/1/secret');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(page.getByText('Discord webhook …secret')).toBeVisible();

        await expect(page.getByLabel('Alert type')).toHaveValue('gas_below');
        await page.getByLabel('Base fee at or under (gwei)').fill('5');
        await page.getByRole('button', { name: 'Create alert' }).click();
        await expect(page.getByText('Base fee at or under 5 gwei')).toBeVisible();
        await page.getByRole('button', { name: 'Pause' }).click();
        await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
        await expect(page.getByText('Gas is 3.10 gwei')).toBeVisible();
    });
});
