import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coinPricesPro } from '../../UtilFunctions/coinPricesPRO';
import PricesInfoTable from '../PricesInfoTable/PricesInfoTable';

// PricesPage component consisting of cryptocurrency price lookups
const PricesPage = () => {
    const coinPricesQuery = useQuery({
        queryKey: ['coinPrices'],
        queryFn: coinPricesPro
    });

    // Conditionally rendering component based on query status
    if (coinPricesQuery.isLoading || coinPricesQuery.isFetching) {
        return <div>Loading...</div>
    }
    else if (coinPricesQuery.isError || coinPricesQuery.error) {
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
                <PricesInfoTable coinData={ coinPricesQuery.data } />
            </div>
        );
    }
};

export default PricesPage;