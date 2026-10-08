import type { MetadataRoute } from "next";

// Web app manifest: lets people install the dashboard (Add to Home Screen / Install app), which is also
// what iPhones need before they allow push notifications.
export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: 'Ethereum Dashboard',
        short_name: 'ETH Dashboard',
        description: 'Free Ethereum analytics: wallets, tokens, NFTs, DeFi, staking and layer 2s, with alerts and safe, simulated transactions.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#1f2937',
        theme_color: '#111827',
        categories: ['finance', 'utilities'],
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
            { name: 'Gas tracker', url: '/gas-tracker' },
            { name: 'My wallet', url: '/me' },
            { name: 'Alerts', url: '/alerts' },
            { name: 'Swap', url: '/swap' }
        ]
    };
}
