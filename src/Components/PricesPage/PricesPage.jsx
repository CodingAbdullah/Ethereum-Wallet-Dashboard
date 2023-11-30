import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coinPrices } from '../../UtilFunctions/coinPrices';
import { coinPricesPro } from '../../UtilFunctions/coinPricesPro';
import PriceCoinCard from '../PriceCoinCard/PriceCoinCard';

const PricesPage = () => {
    // Incorporating React Query for faster and more efficient data fetch
    const { data, isPending, isError, error } = useQuery({
        queryKey: ['coin prices'],
        queryFn: coinPricesPro
     });

    // Props to be added later after more filtering and testing, the layout is complete for now
    if (isPending){
        return ( 
            <div role="main">
                <div>Loading...</div>
            </div>
        )
    }
    else if (isError) {
        return ( 
            <div role="main">
                Err...
            </div>
        )
    }
    else if (data) {
        return (
            <main className="p-3" role="main">
                <h1 style={{ marginTop: '2rem' }}>Prices Chart</h1>
                <p>Here is the list of the latest prices on the top 10 coins by <b>popularity.</b></p>
                <div>
                    <div class="row">
                    {
                           data.map((coin, key) => {
                                return (
                                    <PriceCoinCard id={key} name={ Object.keys(coin)[0] } coinInfo={coin[Object.keys(coin)[0]]} /> // Display child components by passing properties to them
                                );
                            })
                        }
                    </div> 
                </div>
            </main>
        )
    }
}

export default PricesPage;