'use client';

import Link from 'next/link';
import GenericFetcher from '@/app/utils/functions/GenericFetcher';
import useSWR from 'swr';
import EthereumGasDataType from '../utils/types/EthereumGasDataType';
import NavbarEthereumDataType from '../utils/types/NavbarEthereumDataType';
import { useLiveBlock, useSecondsSince } from '../hooks/useLiveBlock';

// Metrics bar under the navbar: ETH price (polled), gas estimate (polled) and the latest block (live
// over Server-Sent Events). Each item degrades on its own, so one failing source doesn't hide the rest.
export default function MetricsNavbar() {
    const { data: ethData } = useSWR<NavbarEthereumDataType>('/api/navbar/ethereum-price', GenericFetcher, { refreshInterval: 50000 });
    const { data: gasData } = useSWR<EthereumGasDataType>('/api/navbar/gas-track', GenericFetcher, { refreshInterval: 50000 });
    const { block, status } = useLiveBlock();
    const age = useSecondsSince(block?.timestamp);
    const ethereum = ethData?.ethereum;
    const live = status === 'live';

    return (
        <nav aria-label="Live metrics" className="bg-gray-900 text-white py-2 px-4 text-sm">
            <div className="container mx-auto flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-2" title={live ? 'Receiving new blocks' : 'Connecting to the network'}>
                    <span className={`w-2 h-2 rounded-full ${live ? 'ping-animation bg-green-500' : 'bg-gray-500'}`} aria-hidden="true"></span>
                    <span className={`text-xs font-semibold ${live ? 'text-green-500' : 'text-gray-400'}`}>{live ? 'Live' : status === 'unavailable' ? 'Offline' : 'Connecting'}</span>
                </span>
                <span>ETH: {ethereum ? <>${Number(ethereum.usd).toFixed(2)}{' '}
                    <span className={ethereum.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}>{ethereum.usd_24h_change > 0 ? '+' : ''}{ethereum.usd_24h_change.toFixed(2)}%</span></> : <span className="text-gray-500">—</span>}
                </span>
                <span>Gas: {gasData ? <span className="font-bold">{String(gasData.maxPrice)} gwei</span> : <span className="text-gray-500">—</span>}</span>
                {block && (
                    <span className="text-gray-300">
                        Block <Link href={`/block/${block.number}`} className="underline tabular-nums">{block.number.toLocaleString('en-US')}</Link>
                        {age !== null && <span className="text-gray-500 tabular-nums"> · {age}s ago</span>}
                        {block.baseFeeGwei !== null && <span className="hidden sm:inline text-gray-500"> · base fee {block.baseFeeGwei < 0.1 ? block.baseFeeGwei.toPrecision(2) : block.baseFeeGwei.toFixed(2)} gwei · {block.gasUsedPercent.toFixed(0)}% full</span>}
                    </span>
                )}
            </div>
        </nav>
    )
}
