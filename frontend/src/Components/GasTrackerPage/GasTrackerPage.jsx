import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import GasBaseFeeCard from '../GasBaseFeeCard/GasBaseFeeCard';
import GasBlockPriceCard from '../GasBlockPriceCard/GasBlockPriceCard';

const GasTrackerPage = () => {
    const NODE_SERVER_URL = 'http://localhost:5000';
    const GAS_TRACK_ENDPOINT = '/gas-track'

    const navigate = useNavigate();

    const [gasInfo, updateGasInfo] = useState({
        information: null
    });

    const clearHandler = () => {
        updateGasInfo((prevState) => { // Clear data when error found with API request
            return {
                ...prevState,
                information: null
            }
        });
    }

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json'
            }
        };

       axios.get(NODE_SERVER_URL + GAS_TRACK_ENDPOINT, options)
       .then(res => {
            if (res.status === 200){
                updateGasInfo((prevState) => { // If successful, update information
                    return {
                        ...prevState,
                        information: res.data.information
                    }
                });
            }
            else {
                clearHandler();
            }
       })
       .catch(() => {
            clearHandler();
       });
    }, [])
    
    if (gasInfo.information === null){
        return <div role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">Loading...</div>
    }
    else { 
        // Using parent-child component hierarchy, pass down state information for display and leaner code
        return (
            <div className='gas-tracker-page'>
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">Gas Information</h1>
                    </div>
                    <div class="jumbotron">
                        <h4 style={{marginTop: '-2rem'}} class="display-5">General Metrics</h4>
                        <div style={{marginTop: '3rem', marginBottom: '-2rem'}} class="container">
                            <p>System: <b>{gasInfo.information.system.substring(0, 1).toUpperCase() + gasInfo.information.system.substring(1)}</b></p>
                            <p>Network: <b>{gasInfo.information.network.substring(0, 1).toUpperCase() + gasInfo.information.network.substring(1)}</b></p>
                            <p>Unit: <b>{gasInfo.information.unit.substring(0 ,1).toUpperCase() + gasInfo.information.unit.substring(1)}</b></p>
                            <p>Max Price: <b>{gasInfo.information.maxPrice}</b></p>
                            <p>Current Block Number: <b>{gasInfo.information.currentBlockNumber}</b></p>
                            <p>MsSinceLastBlock: <b>{gasInfo.information.msSinceLastBlock}</b></p>
                        </div>
                    </div>
                    <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">Block Prices</h3>
                    </div> 
                    <div style={{marginTop: '2rem'}} class="row">
                        { gasInfo.information.blockPrices[0].estimatedPrices.map((block, key) => {
                            return (
                                <GasBlockPriceCard id={key} information={block}/>
                            )
                        })}
                    </div>
                    <div style={{marginTop: '4rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">Base Fees</h3>
                    </div>  
                    <div style={{marginTop: '2rem'}} class="row">
                        { gasInfo.information.estimatedBaseFees.map((base, key) => {
                            return (
                                <GasBaseFeeCard id={key} information={base} />
                            )
                        })}
                    </div>
                    <div>
                        <button style={{marginTop: '3rem', marginRight: '1rem'}} onClick={() => navigate("/")}class='btn btn-success'>Go To Dashboard</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default GasTrackerPage;