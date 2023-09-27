import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { metricsNavbarGasPrice } from '../../UtilFunctions/metricsNavbarGasPrice';
import { useNavigate } from 'react-router';
import GasBaseFeeCard from '../GasBaseFeeCard/GasBaseFeeCard';
import GasBlockPriceCard from '../GasBlockPriceCard/GasBlockPriceCard';

const GasTrackerPage = () => {
    // Setting up query to fetch Ethereum gas price
    const gasPriceQuery = useQuery({
        queryKey: ['gas price'],
        queryFn: metricsNavbarGasPrice
    });

    const navigate = useNavigate();
    
    if (gasPriceQuery.isLoading){
        return <div role="main" class="p-3">Loading...</div>
    }
    else if (gasPriceQuery.isError){
        return <div role="main" class="p-3">Error fetching gas information</div>
    }
    else if (gasPriceQuery.isSuccess){ 
        // Using parent-child component hierarchy, pass down state information for display and leaner code
        let gas = gasPriceQuery.data[0].information;
        return (
            <div className='gas-tracker-page'>
                <main role="main" class="p-3">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">Gas Information</h1>
                    </div>
                    <div class="jumbotron">
                        <h4 style={{ marginTop: '-1rem' }} class="display-5">General Metrics</h4>
                        <div style={{ marginTop: '3rem', marginBottom: '-2rem' }} class="container">
                            <p>System: <b>{ gas.system.substring(0, 1).toUpperCase() + gas.system.substring(1) }</b></p>
                            <p>Network: <b>{ gas.network.substring(0, 1).toUpperCase() + gas.network.substring(1) }</b></p>
                            <p>Unit: <b>{ gas.unit.substring(0 ,1).toUpperCase() + gas.unit.substring(1) }</b></p>
                            <p>Max Price: <b>{ gas.maxPrice }</b></p>
                            <p>Current Block Number: <b>{ gas.currentBlockNumber }</b></p>
                            <p>MsSinceLastBlock: <b>{ gas.msSinceLastBlock }</b></p>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">Block Prices</h3>
                    </div> 
                    <div style={{ marginTop: '2rem' }} class="row">
                        { gas.blockPrices[0].estimatedPrices.map((block, key) => {
                            return (
                                <GasBlockPriceCard id={ key } information={ block }/>
                            )
                        })}
                    </div>
                    <div style={{ marginTop: '4rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">Base Fees</h3>
                    </div>  
                    <div style={{ marginTop: '2rem' }} class="row">
                        { gas.estimatedBaseFees.map((base, key) => {
                            return (
                                <GasBaseFeeCard id={ key } information={ base } />
                            )
                        })}
                    </div>
                    <div>
                        <button style={{ marginTop: '3rem'}} onClick={ () => navigate("/") } class='btn btn-success'>Go To Dashboard</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default GasTrackerPage;