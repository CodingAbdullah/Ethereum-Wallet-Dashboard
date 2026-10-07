import { describe, expect, it, vi } from "vitest";
import { deliver, isDiscordWebhook, isEmail, plainText } from "./deliver";
import { verifySignature } from "./signing";

const ok = () => vi.fn<typeof fetch>(async () => new Response('{}', { status: 200 }));
const d = (kind: 'telegram' | 'discord' | 'email', target: string) => ({ channel: { kind, target }, title: 'Gas is low', message: 'Base fee is 0.4 gwei @everyone', url: 'https://ethereumdashboard.dev/gas-tracker' });

describe("deliver", () => {
    it("sends straight to Telegram, Discord and email when n8n isn't configured", async () => {
        const fetcher = ok();
        const env = { TELEGRAM_BOT_TOKEN: 'bot123', RESEND_API_KEY: 're_1', ALERTS_FROM_EMAIL: 'alerts@ethereumdashboard.dev' };
        expect(await deliver(d('telegram', '42'), env, fetcher)).toBe('direct');
        await deliver(d('discord', 'https://discord.com/api/webhooks/1/abc'), env, fetcher);
        await deliver(d('email', 'me@example.com'), env, fetcher);

        const [tg, dc, em] = fetcher.mock.calls;
        expect(String(tg[0])).toBe('https://api.telegram.org/botbot123/sendMessage');
        expect(JSON.parse(String(tg[1]!.body))).toMatchObject({ chat_id: '42', disable_web_page_preview: true });
        // Discord never pings, even if the alert text contains @everyone
        expect(JSON.parse(String(dc[1]!.body)).allowed_mentions).toEqual({ parse: [] });
        expect(String(em[0])).toBe('https://api.resend.com/emails');
        expect(JSON.parse(String(em[1]!.body))).toMatchObject({ to: 'me@example.com', subject: 'Gas is low' });
        expect((em[1]!.headers as Record<string, string>).authorization).toBe('Bearer re_1');
    });

    it("hands everything to n8n with a valid signature when configured", async () => {
        const fetcher = ok();
        expect(await deliver(d('telegram', '42'), { N8N_WEBHOOK_URL: 'https://n8n.example/webhook/alerts', N8N_WEBHOOK_SECRET: 'shh' }, fetcher)).toBe('n8n');
        const [url, init] = fetcher.mock.calls[0];
        expect(String(url)).toBe('https://n8n.example/webhook/alerts');
        const body = String(init!.body);
        expect(JSON.parse(body)).toMatchObject({ channel: { kind: 'telegram', target: '42' }, text: plainText(d('telegram', '42')) });
        expect(verifySignature('shh', body, (init!.headers as Record<string, string>)['x-signature'])).toBe(true);
    });

    it("fails clearly when a channel isn't configured or the service errors", async () => {
        await expect(deliver(d('telegram', '42'), {}, ok())).rejects.toThrow('TELEGRAM_BOT_TOKEN');
        await expect(deliver(d('email', 'a@b.co'), {}, ok())).rejects.toThrow('RESEND_API_KEY');
        await expect(deliver(d('telegram', '42'), { N8N_WEBHOOK_URL: 'https://n8n.example/x' }, ok())).rejects.toThrow('N8N_WEBHOOK_SECRET');
        const failing = vi.fn<typeof fetch>(async () => new Response('', { status: 403 }));
        await expect(deliver(d('discord', 'https://discord.com/api/webhooks/1/abc'), {}, failing)).rejects.toThrow('discord.com responded with 403');
    });
});

describe("validation", () => {
    it("accepts only Discord webhook URLs and plausible emails", () => {
        expect(isDiscordWebhook('https://discord.com/api/webhooks/123/abc-DEF_9')).toBe(true);
        expect(isDiscordWebhook('https://evil.com/api/webhooks/123/abc')).toBe(false);
        expect(isDiscordWebhook('http://discord.com/api/webhooks/123/abc')).toBe(false);
        expect(isEmail('me@example.com')).toBe(true);
        expect(isEmail('not an email')).toBe(false);
    });

    it("keeps messages plain and within size limits", () => {
        expect(plainText({ channel: { kind: 'email', target: '' }, title: 'T', message: 'x'.repeat(5000) }).length).toBe(3500);
    });
});
