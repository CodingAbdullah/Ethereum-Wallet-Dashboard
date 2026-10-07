'use client';

import useSWR from 'swr';
import GenericFetcher from '../utils/functions/GenericFetcher';
import StatTile from './StatTile';
import type NavbarEthereumDataType from '../utils/types/NavbarEthereumDataType';
import type EthereumGasDataType from '../utils/types/EthereumGasDataType';
import type { Section } from '@/lib/defi';
import type { SupplySummary } from '@/lib/ethSupply';

// Headline numbers: ETH price, gas, 24h supply change and the share of ETH staked.
// Each tile loads on its own (they share caches with the navbar and /eth-supply).
export default function HomeStatRow() {
    const { data: price } = useSWR<NavbarEthereumDataType>('/api/navbar/ethereum-price', GenericFetcher, { refreshInterval: 60000 });
    const { data: gas } = useSWR<EthereumGasDataType>('/api/navbar/gas-track', GenericFetcher, { refreshInterval: 60000 });
    const { data: supply } = useSWR<Section<SupplySummary>>('/api/eth-supply', GenericFetcher, { revalidateOnFocus: false });

    const eth = price?.ethereum;
    const s = supply && 'data' in supply ? supply.data : null;
    const stakedShare = s?.stakedEth && s.supply ? s.stakedEth / s.supply : null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
                label="ETH price"
                value={eth ? '$' + eth.usd.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                note={eth ? <span className={eth.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}>{(eth.usd_24h_change >= 0 ? '+' : '') + eth.usd_24h_change.toFixed(2)}% 24h</span> : undefined}
            />
            <StatTile label="Gas" value={gas ? `${gas.maxPrice} gwei` : '—'} note={gas ? `block ${gas.currentBlockNumber.toLocaleString('en-US')}` : undefined} />
            <StatTile
                label="Supply change (24h)"
                value={s?.netEth != null ? <span className={s.netEth < 0 ? 'text-green-400' : 'text-gray-100'}>{(s.netEth > 0 ? '+' : '') + Math.round(s.netEth).toLocaleString('en-US')} ETH</span> : s ? Math.round(s.burnEth).toLocaleString('en-US') + ' ETH burnt' : '—'}
                note={s?.netEth != null ? (s.netEth < 0 ? 'burn outpaced issuance' : 'issuance outpaced burn') : undefined}
            />
            <StatTile label="ETH staked" value={stakedShare ? (stakedShare * 100).toFixed(1) + '%' : '—'} note={s?.stakedEth ? `≈${(s.stakedEth / 1e6).toFixed(1)}M ETH` : undefined} />
        </div>
    );
}
