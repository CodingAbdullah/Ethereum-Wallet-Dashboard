'use client';

import { useEffect, useState } from 'react';
import type { LiveBlock } from '@/lib/live';

// Subscribes to /api/live (Server-Sent Events). EventSource reconnects by itself when the server
// closes the stream (about once a minute), so this stays live as long as the page is open.
export function useLiveBlock(chain = 'eth') {
    const [block, setBlock] = useState<LiveBlock | null>(null);
    const [status, setStatus] = useState<'connecting' | 'live' | 'unavailable'>('connecting');

    useEffect(() => {
        if (typeof EventSource === 'undefined') return;
        const source = new EventSource('/api/live?chain=' + encodeURIComponent(chain));
        source.addEventListener('block', e => {
            setBlock(JSON.parse((e as MessageEvent).data));
            setStatus('live');
        });
        source.addEventListener('unavailable', () => setStatus('unavailable'));
        return () => source.close();
    }, [chain]);

    return { block, status };
}

// Seconds since a block, ticking every second
export function useSecondsSince(timestamp: number | undefined) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    return timestamp ? Math.max(0, Math.round(now / 1000 - timestamp)) : null;
}
