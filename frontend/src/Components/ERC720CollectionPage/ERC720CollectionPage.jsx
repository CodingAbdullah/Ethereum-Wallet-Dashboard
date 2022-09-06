import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../Alert/Alert';
import ERC720TransfersInfoTable from '../ERC720TransfersInfoTable/ERC720TransfersInfoTable';
import ERC720PricesInfoTable from '../ERC720PricesInfoTable/ERC720PricesInfoTable';

const ERC720CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);
    const [setPrice, updateERC20Price] = useState(null);

    const [ERC20Transfers, updateTransfers] = useState({
        information: null
    });

    const [ERC20Information, updateERC20Information] = useState({
        information: null
    });

    const ERC20_MORALIS_URL = 'https://deep-index.moralis.io/api/v2/erc20/'; // API Endpoints for ERC20 lookup
    const COINGECKO_URL = 'https://api.coingecko.com/api/v3'; // API Endpoints
    
    const TRANSFERS_ENDPOINT = '/transfers';
    const PRICE_ENDPOINT = '/price'
    const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + tokenAddress;
        
    const clearHandler = () => {
        updateAlert(true); // Add alerts if any don't exist, and clear all information for analytics
        updateTransfers((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateERC20Price(null);
        updateERC20Information((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    const formHandler = (e) => {
        e.preventDefault();

        // Set options for fetch and flight responses
        const options = {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
                'access-control-allow-origin': '*',
                'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Transpose API key hidden 
            }
        }

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.get(ERC20_MORALIS_URL + tokenAddress + TRANSFERS_ENDPOINT, options) // ERC20 endpoint for retrieving information related to transfers
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, remove information
                        updateAlert(false);
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.result
                            }
                        });
                        console.log(response);
                    }
                }
            })
            .catch(err => {
                console.log(err)
                clearHandler();
            });

            axios.get(ERC20_MORALIS_URL + tokenAddress + PRICE_ENDPOINT, options) // ERC20 endpoint for retrieving information related to price
                .then(response => {
                    console.log(response);
                    if (response.status !== 200){
                        clearHandler();                    }
                    else {
                        if (response.status === 200 && Object.keys(response.data).length === 0){ // If empty, clear price
                            clearHandler();                            
                        }
                        else {
                            updateERC20Price(response.data.usdPrice);
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    clearHandler();
                });
            
            axios.get(COINGECKO_URL + ERC20_INFO_ENDPOINT) // Retrieve price of ERC20 coin from coingecko
            .then(response => {
                console.log(response);
                if (response.status !== 200){
                    clearHandler();
                }
                else {
                    if (response.status === 200 && Object.keys(response).length > 0) { // Check results to see if they match criteria
                        updateERC20Information((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        })
                    }
                    else {
                        clearHandler();
                    }
                }
            })
            .catch(err => {
                console.log(err)
                clearHandler();
            });
        }
        else {
            clearHandler();
        }   
    }
        return (
            <div className="erc720-collection-page">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">ERC20 Analytics</h1>
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <p style={{marginTop: '3rem'}}>Enter Contract Address of an <b>ERC20</b> token for analytics</p>
                    <form onSubmit={formHandler}>
                        <input style={{marginRight: '2rem'}} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                        <button type='submit' class='btn btn-success'>Submit</button>
                    </form>   
                </main>
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    { setPrice === null ? null : <h3 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>Price: $<b>{setPrice.toPrecision(4)}</b> USD</h3> } 
                    {
                        // Display data of the valid ERC20 token
                        ERC20Information.information === null ? <div /> :
                        <ERC720PricesInfoTable data={ERC20Information} />
                    }
                </main>
                <main role="main">
                    <div style={{marginTop: '5rem', marginLeft: '5rem'}}>
                        { ERC20Transfers.information === null ? <div /> : <h5 style={{marginLeft: '8rem'}}>Top 100 Transfers for Token: <b>{tokenAddress}</b></h5> }
                        { ERC20Transfers.information === null ? <div /> : <ERC720TransfersInfoTable address={null} data={ERC20Transfers.information} /> }
                    </div>
                </main>
            </div>
        )
    }

export default ERC720CollectionPage;
