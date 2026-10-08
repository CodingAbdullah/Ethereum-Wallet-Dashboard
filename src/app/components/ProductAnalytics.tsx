'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { initAnalytics, track } from '@/lib/analytics';

// Starts the optional analytics (see src/lib/analytics.ts) and records app-wide events:
// a wallet connecting (which kind of wallet, never the address) and the app being installed.
export default function ProductAnalytics() {
    const { status, connector } = useAccount();
    const previous = useRef(status);

    useEffect(() => {
        initAnalytics();
        const installed = () => track('app_installed');
        window.addEventListener('appinstalled', installed);
        return () => window.removeEventListener('appinstalled', installed);
    }, []);

    useEffect(() => {
        // Only a fresh connection, not a reconnect on page load
        if (status === 'connected' && previous.current === 'connecting') track('wallet_connected', { wallet: connector?.id ?? 'unknown' });
        previous.current = status;
    }, [status, connector]);

    return null;
}
