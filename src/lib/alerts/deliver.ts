import { signBody, SIGNATURE_HEADER } from "./signing";

// Sends one alert to one channel.
// With N8N_WEBHOOK_URL set, the alert goes to n8n (signed with N8N_WEBHOOK_SECRET), which routes it to
// Telegram / Discord / email. Without it, the app sends directly, so alerts work before n8n is set up.

export type ChannelKind = 'telegram' | 'discord' | 'email';

export interface Delivery {
    channel: { kind: ChannelKind; target: string };
    title: string;
    message: string;
    url?: string | null;
    eventId?: number;
}

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export const SITE_URL = 'https://ethereumdashboard.dev';
const MAX_MESSAGE = 3500;          // under Telegram's 4096 and Discord's 2000 after trimming below

// Plain text only: no Markdown/HTML parsing, so token names can't inject formatting or links
export function plainText(d: Delivery): string {
    const text = `${d.title}\n\n${d.message}${d.url ? `\n\n${d.url}` : ''}`;
    return text.length > MAX_MESSAGE ? text.slice(0, MAX_MESSAGE - 1) + '…' : text;
}

async function post(fetcher: Fetch, url: string, body: unknown, headers: Record<string, string> = {}) {
    const response = await fetcher(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
        signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`${new URL(url).hostname} responded with ${response.status}`);
}

export async function deliverDirect(d: Delivery, env: Env = process.env, fetcher: Fetch = fetch): Promise<void> {
    const text = plainText(d);
    switch (d.channel.kind) {
        case 'telegram':
            if (!env.TELEGRAM_BOT_TOKEN) throw new Error('Telegram is not configured (TELEGRAM_BOT_TOKEN)');
            return post(fetcher, `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: d.channel.target, text, disable_web_page_preview: true });
        case 'discord':
            // No @everyone / role pings, whatever the alert text contains
            return post(fetcher, d.channel.target, { content: text.slice(0, 1990), allowed_mentions: { parse: [] } });
        case 'email':
            if (!env.RESEND_API_KEY || !env.ALERTS_FROM_EMAIL) throw new Error('Email alerts are not configured (RESEND_API_KEY, ALERTS_FROM_EMAIL)');
            return post(fetcher, 'https://api.resend.com/emails', { from: env.ALERTS_FROM_EMAIL, to: d.channel.target, subject: d.title, text }, { authorization: `Bearer ${env.RESEND_API_KEY}` });
    }
}

export async function deliver(d: Delivery, env: Env = process.env, fetcher: Fetch = fetch): Promise<'n8n' | 'direct'> {
    if (env.N8N_WEBHOOK_URL) {
        if (!env.N8N_WEBHOOK_SECRET) throw new Error('N8N_WEBHOOK_SECRET is required with N8N_WEBHOOK_URL');
        const body = JSON.stringify({ ...d, text: plainText(d) });
        await post(fetcher, env.N8N_WEBHOOK_URL, body, { [SIGNATURE_HEADER]: signBody(env.N8N_WEBHOOK_SECRET, body) });
        return 'n8n';
    }
    await deliverDirect(d, env, fetcher);
    return 'direct';
}

export const isDiscordWebhook = (url: string) => /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
export const isEmail = (value: string) => /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(value) && value.length <= 254;
