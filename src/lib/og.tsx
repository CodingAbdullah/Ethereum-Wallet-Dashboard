import { ImageResponse } from "next/og";

// Share images (Open Graph / Twitter cards), 1200x630, in the site's dark style.
// Used by the default card and the transaction, address and token cards.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export interface OgCard {
    eyebrow: string;            // e.g. "Transaction · Ethereum"
    title: string;
    lines?: string[];           // up to 4 short facts
    badge?: { text: string; tone: 'good' | 'bad' | 'neutral' };
}

const TONES = { good: '#4ade80', bad: '#f87171', neutral: '#d1d5db' };

export function ogImage(card: OgCard): ImageResponse {
    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 30, letterSpacing: 6, color: '#d1d5db', fontWeight: 700 }}>ΞTHERΞUM DASHBOARD</div>
                    {card.badge && (
                        <div style={{ display: 'flex', fontSize: 28, padding: '8px 22px', borderRadius: 999, border: `2px solid ${TONES[card.badge.tone]}`, color: TONES[card.badge.tone] }}>{card.badge.text}</div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ fontSize: 30, color: '#9ca3af' }}>{card.eyebrow}</div>
                    <div style={{ fontSize: card.title.length > 30 ? 56 : 72, fontWeight: 700, lineHeight: 1.1, wordBreak: 'break-all' }}>{card.title}</div>
                    {(card.lines ?? []).slice(0, 4).map((line, i) => (
                        <div key={i} style={{ fontSize: 30, color: '#d1d5db' }}>{line}</div>
                    ))}
                </div>
                <div style={{ fontSize: 24, color: '#6b7280' }}>ethereumdashboard.dev</div>
            </div>
        ),
        OG_SIZE
    );
}

// Live data for a card, or null after `ms` so a slow provider never breaks a link preview
export function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T | null> {
    return Promise.race([promise.catch(() => null), new Promise<null>(resolve => setTimeout(() => resolve(null), ms))]);
}

export const shortHex = (value: string, chars = 6) => value.length > chars * 2 + 2 ? `${value.slice(0, chars + 2)}…${value.slice(-chars)}` : value;
