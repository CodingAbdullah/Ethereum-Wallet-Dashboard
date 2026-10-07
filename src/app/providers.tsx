'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWagmiConfig } from '@/lib/wagmi';
import SearchPalette from './components/SearchPalette';

// Client-side providers for wallet connection. The layout stays a server component;
// only this wrapper and the components that use wallet hooks run in the browser.
export default function Providers({ children }: { children: React.ReactNode }) {
    const [config] = useState(createWagmiConfig);
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
                <SearchPalette />
            </QueryClientProvider>
        </WagmiProvider>
    );
}
