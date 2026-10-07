'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveBlock } from '@/app/hooks/useLiveBlock';

// Shown on a pending transaction: checks its status on every new block and reloads the page once it's mined
export default function TxLiveStatus({ hash, chain }: { hash: string; chain: string }) {
    const router = useRouter();
    const { block, status } = useLiveBlock(chain);
    const done = useRef(false);

    useEffect(() => {
        if (!block || done.current) return;
        fetch(`/api/tx-status?hash=${hash}&chain=${chain}`)
            .then(r => r.ok ? r.json() : null)
            .then(result => {
                if (result && result.status !== 'pending' && !done.current) {
                    done.current = true;
                    router.refresh();
                }
            })
            .catch(() => {});
    }, [block, hash, chain, router]);

    return (
        <p className="text-sm text-amber-300" role="status">
            Waiting to be included in a block{status === 'live' && block ? ` (checked at block ${block.number.toLocaleString('en-US')})` : ''}. This page updates by itself.
        </p>
    );
}
