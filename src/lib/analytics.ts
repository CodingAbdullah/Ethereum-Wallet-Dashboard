// Product analytics: a handful of named events that show whether people get through the main flows
// (connect → sign in → create an alert, preview → confirm a transaction, ask the assistant).
// Privacy: no wallet addresses, names, hashes or amounts, ever; only the event name and a few fixed
// labels (a chain key, an alert type). Events go to whichever free tools are configured:
// - Umami (UMAMI_URL, UMAMI_DATA_WEBSITE_ID), already used for page views
// - PostHog (NEXT_PUBLIC_POSTHOG_KEY), optional, for funnels; cookieless, no autocapture or recordings
// With neither configured, track() does nothing.

export type AnalyticsEvent =
    | 'wallet_connected'
    | 'signed_in'
    | 'channel_added'
    | 'alert_created'
    | 'tx_previewed'
    | 'tx_confirmed'
    | 'tx_failed'
    | 'agent_question'
    | 'api_key_created'
    | 'app_installed';

type Props = Record<string, string | number | boolean>;

// Only short label-like values pass, so an address or free text can't slip into an event by mistake
const SAFE_VALUE = /^[a-z0-9_.-]{1,40}$/i;
export function safeProps(props: Props = {}): Props {
    return Object.fromEntries(Object.entries(props).filter(([, v]) =>
        typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && SAFE_VALUE.test(v) && !/^0x[0-9a-f]{6,}/i.test(v))));
}

declare global {
    interface Window { umami?: { track: (event: string, data?: Props) => void } }
}

type PostHog = { capture: (event: string, props?: Props) => void };
let posthog: Promise<PostHog | null> | null = null;

// Written out in full: Next.js only inlines NEXT_PUBLIC_ variables into the browser bundle this way
const PUBLIC_ENV = { NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST };

export function posthogConfig(env: Record<string, string | undefined> = PUBLIC_ENV) {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return null;
    return {
        key,
        options: {
            api_host: env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            persistence: 'memory' as const,             // no cookies or local storage
            person_profiles: 'never' as const,            // no person profiles: events stay anonymous
            autocapture: false,
            capture_pageview: 'history_change' as const,
            capture_pageleave: false,
            disable_session_recording: true,
            disable_surveys: true,
            mask_all_text: true,
            mask_all_element_attributes: true,
            // Wallet and transaction pages put addresses and hashes in the URL: keep only the route
            before_send: (event: { properties?: Record<string, unknown> } | null) => {
                if (event?.properties) for (const k of ['$current_url', '$pathname', '$referrer', '$initial_current_url', '$initial_pathname']) {
                    if (typeof event.properties[k] === 'string') event.properties[k] = redactUrl(event.properties[k] as string);
                }
                return event;
            }
        }
    };
}

// "/address/0xabc…?tab=x" -> "/address/[id]"
export function redactUrl(url: string): string {
    try {
        const parsed = new URL(url, 'https://ethereumdashboard.dev');
        const path = parsed.pathname.split('/').map(part => /^0x[0-9a-f]+$/i.test(part) || /\.eth$/i.test(part) || /^\d{4,}$/.test(part) || part.length > 40 ? '[id]' : part).join('/');
        return /^https?:/.test(url) ? parsed.origin + path : path;
    }
    catch {
        return '[url]';
    }
}

// Loaded on first use, only when a key is set, so the library isn't in the bundle otherwise
function loadPostHog(): Promise<PostHog | null> {
    const config = posthogConfig();
    if (!config || typeof window === 'undefined') return Promise.resolve(null);
    posthog ??= import('posthog-js')
        .then(({ default: ph }) => { ph.init(config.key, config.options as never); return ph as unknown as PostHog; })
        .catch(() => null);
    return posthog;
}

export function initAnalytics() {
    void loadPostHog();
}

export function track(event: AnalyticsEvent, props?: Props) {
    if (typeof window === 'undefined') return;
    const data = safeProps(props);
    try { window.umami?.track(event, data); } catch { /* analytics never breaks the app */ }
    void loadPostHog().then(ph => ph?.capture(event, data)).catch(() => {});
}
