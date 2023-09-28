import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { metricsNavbarEthPrice } from '../../UtilFunctions/metricsNavbarEthPrice';
import { metricsNavbarGasPrice } from '../../UtilFunctions/metricsNavbarGasPrice';

const SidebarMetricsSection = () => {
    // Setting up query to fetch Ethereum Price
    const ethPriceQuery = useQuery({
        queryKey: ['eth price'],
        queryFn: metricsNavbarEthPrice
    });

    // Setting up query to fetch Ethereum gas price
    const gasPriceQuery = useQuery({
        queryKey: ['gas price'],
        queryFn: metricsNavbarGasPrice
    });

    if ( ethPriceQuery.isLoading || gasPriceQuery.isLoading ){
        return <div>Loading...</div>
    }
    else if (ethPriceQuery.isError || gasPriceQuery.isError){
        return <div>Error Fetching data</div>
    }
    else if (ethPriceQuery.isSuccess && gasPriceQuery.isSuccess){

        // Adding another Navbar containing ETH price and gas information
        let price = ethPriceQuery.data[Object.keys(ethPriceQuery.data)[0]].ethereum;
        let gas = gasPriceQuery.data[0].information;

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-dark">
                <div className="container-fluid">
                    <div>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item"> 
                                <p style={{ paddingLeft: '1rem', display: 'inline', color: 'white', marginTop: '1rem'}}>ETH Price: <b>{ price == null ? "Loading" : "$" + price.usd.toFixed(2) }</b></p>
                            </li>
                            <li className="nav-item">
                                <p style={{ paddingLeft: '1rem', display: 'inline', color: 'white' }}>24-Hr % Chg:</p>
                                <p style={{ color: price.usd_24h_change < 0 ? 'red' : 'lightgreen', marginTop: '1rem', display: 'inline' }}>
                                    <b>{ price.usd_24h_change > 0 ? " +" + price.usd_24h_change.toFixed(2) + "%" : " " + price.usd_24h_change.toFixed(2) + "%" }</b>
                                </p> 
                            </li>
                            <li className="nav-item">
                                <p style={{ paddingLeft: '1rem', display: 'inline', color: 'white' }}>Gas Price:</p>
                                <p style={{ display: 'inline', color: 'white' }}><b>{ " " + gas.maxPrice + " " }Gwei</b></p>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}

export default SidebarMetricsSection;