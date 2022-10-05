import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const navigate = useNavigate();

    // Node Server endpoints
    const NODE_SERVER_URL = 'http://localhost:5000';
    const NODE_SERVER_TOKEN_PRICE_ENDPOINT = '/erc20-token-price';
    const NODE_SERVER_TOKEN_TRANSFER_ENDPOINT = '/erc20-transfer';

    const COINGECKO_URL = 'https://api.coingecko.com/api/v3'; // API Endpoints
    const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + tokenAddress;

    const alertHandler = () => {
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

    const clearHandler = () => {
        updateAlert(false); // Add alerts if any don't exist, and clear all information for analytics
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
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ address : tokenAddress }),
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
            }
        }

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.post(NODE_SERVER_URL + NODE_SERVER_TOKEN_TRANSFER_ENDPOINT, options) // ERC20 endpoint for retrieving information related to transfers
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.information.result.length === 0){ // If empty, remove information
                        updateAlert(false);
                        alertHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information.result
                            }
                        });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                alertHandler();
            });

            axios.post(NODE_SERVER_URL + NODE_SERVER_TOKEN_PRICE_ENDPOINT, options) // ERC20 endpoint for retrieving information related to price
                .then(response => {
                    if (response.status !== 200){
                        alertHandler();                    
                    }
                    else {
                        if (response.status === 200 && Object.keys(response.data.information).length === 0){ // If empty, clear price
                            alertHandler();                            
                        }
                        else {
                            updateERC20Price(response.data.information.usdPrice);
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alertHandler();
                });
            
            axios.get(COINGECKO_URL + ERC20_INFO_ENDPOINT) // Retrieve price of ERC20 coin from coingecko
            .then(response => {
                console.log(response);
                if (response.status !== 200){
                    alertHandler();
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
                        alertHandler();
                    }
                }
            })
            .catch(() => {
                alertHandler();
            });
        }
        else {
            alertHandler();
        }   
    }
        return (
            <div className="erc720-collection-page">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">ERC20 Token Analytics</h1>
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <div class="jumbotron">
                        <div class="container">
                            <p>Enter Contract Address of an <b>ERC20</b> token for analytics</p>
                            <form onSubmit={formHandler}>
                                <input onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                                <br />
                                <button style={{marginTop: '2rem'}} type='submit' class='btn btn-success'>Submit</button>
                            </form> 
                            <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button>
                        </div>  
                    </div>
                </main>
                <main class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                    { setPrice === null ? null : <h3 style={{marginTop: '3rem', marginBottom: '1.5rem'}}>Price: $<b>{setPrice.toPrecision(4)}</b> USD/Token</h3> } 
                    <div>
                        {
                            ERC20Information.information === null ? null :
                                <>
                                    <main role="main">
                                        <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                            <h3 class="h3">ERC20 Statistics</h3>
                                        </div>
                                    </main>
                                    <ERC720PricesInfoTable data={ERC20Information} />
                                </>
                        }
                    </div>
                </main>
                <main class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                    <div>
                        {
                            ERC20Transfers.information === null ? null :
                                <>
                                    <main role="main">
                                        <div style={{marginTop: '3rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                            <h3 class="h3">ERC20 Transfers (Recent or Top 100)</h3>
                                        </div>
                                    </main>
                                    <ERC720TransfersInfoTable address={null} data={ERC20Transfers.information} />
                                </>
                        }
                    </div>
                </main>
            </div>
        )
    }

export default ERC720CollectionPage;
