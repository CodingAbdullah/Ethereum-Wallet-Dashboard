import { createHmac, timingSafeEqual } from "node:crypto";
import { keccak256, toBytes } from "viem";

// Webhook signatures.
//
// Our own (app -> n8n): header "X-Signature: t=<unix seconds>,v1=<hex>", where v1 is
// HMAC-SHA256(secret, "<t>.<raw body>"). The timestamp stops a captured request being replayed later.

export const SIGNATURE_HEADER = 'x-signature';
export const MAX_SIGNATURE_AGE_SECONDS = 300;

const hmac = (secret: string, payload: string) => createHmac('sha256', secret).update(payload).digest('hex');

function safeEqual(a: string, b: string): boolean {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

export function signBody(secret: string, body: string, now = Math.floor(Date.now() / 1000)): string {
    return `t=${now},v1=${hmac(secret, `${now}.${body}`)}`;
}

export function verifySignature(secret: string, body: string, header: string | null, now = Math.floor(Date.now() / 1000)): boolean {
    if (!secret || !header) return false;
    const parts = Object.fromEntries(header.split(',').map(p => p.trim().split('=') as [string, string]));
    const t = Number(parts.t);
    if (!Number.isInteger(t) || !parts.v1 || Math.abs(now - t) > MAX_SIGNATURE_AGE_SECONDS) return false;
    return safeEqual(hmac(secret, `${t}.${body}`), parts.v1);
}

// Moralis Streams: header "x-signature" = keccak256(raw body + streams secret)
export function verifyMoralisSignature(secret: string, body: string, header: string | null): boolean {
    if (!secret || !header) return false;
    return safeEqual(keccak256(toBytes(body + secret)).toLowerCase(), header.toLowerCase());
}

// Telegram sends the secret we registered with setWebhook in this header
export function verifyTelegramSecret(secret: string, header: string | null): boolean {
    return !!secret && !!header && safeEqual(secret, header);
}
