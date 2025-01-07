'use client';

import fetcher from '../utils/functions/fetcher';
import { useRef } from 'react';
import useSWR from 'swr';
import EthereumGasDataType from '../utils/types/EthereumGasDataType';
import NavbarEthereumDataType from '../utils/types/NavbarEthereumDataType';

// Custom Metrics Navbar Component
// useSWR for efficient data fetching
export default function MetricsNavbar() {
    const ethPriceRef = useRef<HTMLSpanElement>(null);

    // Data fetching using the custom fetcher function and useSWR
    const { data: ethData, error: ethError, isLoading: ethLoading } = useSWR<NavbarEthereumDataType>('api/navbar/ethereum-price', fetcher, { refreshInterval: 5000 });
    const { data: gasData, error: gasError, isLoading: gasLoading } = useSWR<EthereumGasDataType>('api/navbar/gas-track', fetcher, { refreshInterval: 5000 });

    // Conditionally rendering component
    if (ethError || gasError) 
        return <div className="bg-red-500 text-white p-2">Error fetching data</div>

    else if (ethLoading || gasLoading) 
        return <div className="bg-gray-800 text-white p-2">Loading...</div>

    else if (ethData && gasData) {
        const { ethereum } = ethData;

        // Returning the final JSX code for component
        return (
            <nav className="bg-gray-900 text-white py-2 px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex space-x-4 items-center">
                        <div className="flex items-center space-x-2">
                            <span className="ping-animation w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-green-500 text-xs font-semibold">Live</span>
                        </div>                        
                            <span>ETH Price: <span ref={ethPriceRef}>${ Number(ethereum.usd).toFixed(2) }</span></span>
                        <span>
                            24-Hr % Chg: 
                            <span className={ethereum.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                { ethereum.usd_24h_change > 0 ? ' +' : ' ' }
                                { ethereum.usd_24h_change.toFixed(2) }%
                            </span>
                        </span>
                        <span>Gas Price: <span className="font-bold">{ String(gasData.maxPrice) } Gwei</span></span>
                    </div>
                </div>
            </nav>
        )
    }
}