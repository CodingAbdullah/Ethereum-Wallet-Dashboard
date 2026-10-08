import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = 'Ethereum Dashboard';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The default share image for every page without its own
export default function Image() {
    return ogImage({
        eyebrow: 'Free, open Ethereum analytics',
        title: 'Wallets, tokens, DeFi and layer 2s in one place',
        lines: ['Portfolio, alerts, swaps and an AI assistant', 'Every transaction simulated before you sign']
    });
}
