import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coinPricesPro } from '../../UtilFunctions/coinPricesPRO';
import { topBottomCoinPrices } from '../../UtilFunctions/topBottomCoinPricesPRO';
import PricesInfoTable from '../PricesInfoTable/PricesInfoTable';
import TopCoinsInfoTable from '../TopCoinsInfoTable/TopCoinsInfoTable';
import BottomCoinsInfoTable from '../BottomCoinsInfoTable/BottomCoinsInfoTable';

// PricesPage component consisting of cryptocurrency price lookups
// Setting queries to fetch coin prices and winning/losing coins
const PricesPage = () => {
    const coinPricesQuery = useQuery({
        queryKey: ['coinPrices'],
        queryFn: coinPricesPro
    });

    const topBottomCoinsQuery = useQuery({
        queryKey: ['topBottomCoins'],
        queryFn: topBottomCoinPrices
    });

    // Conditionally rendering component based on query status
    if (coinPricesQuery.isLoading || coinPricesQuery.isFetching || topBottomCoinsQuery.isLoading || topBottomCoinsQuery.isFetching) {   
        return <div>Loading...</div>
    }
    else if (coinPricesQuery.isError || coinPricesQuery.error || topBottomCoinsQuery.isError || topBottomCoinsQuery.error) {
        return <div>Error: {coinPricesQuery.error.message}</div>
    }
    else {
        return (
            <div>
                <main role="main" className="p-3">
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 className="h2">Cryptocurrency Price Lookups</h1>
                    </div>
                </main>
                <TopCoinsInfoTable topCoins={ topBottomCoinsQuery.data.top_gainers } />
                <BottomCoinsInfoTable bottomCoins={ topBottomCoinsQuery.data.top_losers } />
                <PricesInfoTable coinData={ coinPricesQuery.data } />
            </div>
        );
    }
};

export default PricesPage;