import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../Alert/Alert';

const ERC720CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const URL = 'https://deep-index.moralis.io/api/v2/'; // API endpoints for NFT lookup
    const LOOKUP_ENDPOINT = 'erc20/';

    const [ERC20Transfers, updateTransfers] = useState({
        information: null
    });

    const formHandler = e => {
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
            axios.get(URL  + LOOKUP_ENDPOINT + tokenAddress, options) // NFT endpoint for retrieving information related to holdings
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateTransfers((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, display warning
                        updateAlert(false);
                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist

                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => console.log(err));

            axios.get(URL + tokenAddress + LOOKUP_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateTransfers((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, keep state to null
                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.result // If data exists, add it to state
                            }
                        });
                    }
                }
            })
            .catch(err => console.log(err));
        }
        else {
            updateAlert(true); // Set Alert
        }
    }

        return (
            <div className="erc720-collection-page">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">ERC20 Analytics</h1>
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <p style={{marginTop: '3rem'}}>Enter Contract Address of your <b>ERC20</b> token for analytics</p>
                    <form onSubmit={formHandler}>
                        <input style={{marginRight: '2rem'}} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                        <button type='submit' class='btn btn-success'>Submit</button>
                    </form>    
                </main>
            </div>
        )
}

export default ERC720CollectionPage;
