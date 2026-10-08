import webpush from "web-push";
import { signBody, SIGNATURE_HEADER } from "./signing";

// Sends one alert to one channel.
// With N8N_WEBHOOK_URL set, the alert goes to n8n (signed with N8N_WEBHOOK_SECRET), which routes it to
// Telegram / Discord / email. Without it, the app sends directly, so alerts work before n8n is set up.
// Browser push always goes direct: it needs the VAPID key, which only this server has.

export type ChannelKind = 'telegram' | 'discord' | 'email' | 'webpush';

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

// A browser push subscription (PushSubscription.toJSON()), stored as the channel target
export interface PushTarget { endpoint: string; keys: { p256dh: string; auth: string } }

// The push services browsers use. The server POSTs to the endpoint, so anything else is refused.
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^[\w-]+\.push\.apple\.com$/, /^[\w-]+\.notify\.windows\.com$/];
const base64url = (v: unknown, min: number, max: number) => typeof v === 'string' && v.length >= min && v.length <= max && /^[\w-]+=*$/.test(v);

// Parses and normalises a subscription (same JSON for the same subscription, so duplicates can be spotted)
export function parsePushTarget(value: string): PushTarget | null {
    let raw: unknown;
    try { raw = JSON.parse(value); } catch { return null; }
    const sub = raw as Partial<PushTarget> | null;
    if (!sub || typeof sub.endpoint !== 'string' || sub.endpoint.length > 800 || !sub.keys) return null;
    let url: URL;
    try { url = new URL(sub.endpoint); } catch { return null; }
    if (url.protocol !== 'https:' || url.port || url.username || !PUSH_HOSTS.some(h => h.test(url.hostname))) return null;
    if (!base64url(sub.keys.p256dh, 80, 100) || !base64url(sub.keys.auth, 16, 30)) return null;
    return { endpoint: url.href, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
}
export const pushTargetJson = (t: PushTarget) => JSON.stringify({ endpoint: t.endpoint, keys: { p256dh: t.keys.p256dh, auth: t.keys.auth } });

export const webPushConfigured = (env: Env = process.env) => !!(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

// The push service says the subscription no longer exists (the user unsubscribed or cleared site data)
export class PushGoneError extends Error {
    constructor() { super('This browser is no longer subscribed'); }
}

async function sendPush(d: Delivery, env: Env, fetcher: Fetch) {
    if (!webPushConfigured(env)) throw new Error('Browser notifications are not configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)');
    const target = parsePushTarget(d.channel.target);
    if (!target) throw new Error('Invalid browser subscription');
    // Push payloads are limited to about 4 KB, so the message is trimmed well under that
    const payload = JSON.stringify({ title: d.title.slice(0, 120), body: d.message.slice(0, 1000), url: d.url ?? undefined, tag: d.eventId ? `alert-${d.eventId}` : undefined });
    const request = webpush.generateRequestDetails(target, payload, {
        vapidDetails: { subject: env.VAPID_SUBJECT || SITE_URL, publicKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, privateKey: env.VAPID_PRIVATE_KEY! },
        TTL: 24 * 60 * 60,
        urgency: 'high'
    });
    const response = await fetcher(request.endpoint, {
        method: request.method,
        headers: Object.fromEntries(Object.entries(request.headers).map(([k, v]) => [k, String(v)])),
        body: request.body ? new Uint8Array(request.body) : undefined,
        signal: AbortSignal.timeout(10_000)
    });
    if (response.status === 404 || response.status === 410) throw new PushGoneError();
    if (!response.ok) throw new Error(`${new URL(request.endpoint).hostname} responded with ${response.status}`);
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
        case 'webpush':
            return sendPush(d, env, fetcher);
    }
}

export async function deliver(d: Delivery, env: Env = process.env, fetcher: Fetch = fetch): Promise<'n8n' | 'direct'> {
    if (env.N8N_WEBHOOK_URL && d.channel.kind !== 'webpush') {
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
