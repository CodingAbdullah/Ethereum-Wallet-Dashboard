'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

// Registers the service worker (offline page, alert notifications) in production builds.
// In development it would serve stale pages between edits, so it isn't registered there.
export default function ServiceWorker() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        registerServiceWorker().catch(() => { /* unsupported or blocked: the site works without it */ });
    }, []);
    return null;
}
