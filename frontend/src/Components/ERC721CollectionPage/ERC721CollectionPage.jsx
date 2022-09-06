import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../Alert/Alert';
import ERC721LowestCollectionPriceInfoTable from './ERC721CollectionLowestPriceInfoTable';
import ERC721CollectionDataInfoTable from './ERC721CollectionDataInfoTable';
import ERC721CollectionTransferInfoTable from './ERC721CollectionTransferInfoTable';
import ERC721CollectionOwnerInfoTable from './ERC721CollectionOwnerInfoTable';
import ERC721CollectionTradeInfoTable from './ERC721CollectionTradeInfoTable';

const ERC721CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const MORALIS_URL = 'https://deep-index.moralis.io/api/v2/nft'; // API endpoints for NFT Analytics
    const LOWESTPRICE_ENDPOINT = '/lowestprice';
    const TRANSFERS_ENDPOINT = '/transfers';
    const OWNERS_ENDPOINT = '/owners';
    const TRADES_ENDPOINT = '/trades';

    const [NFTData, updateNFTData] = useState({
        information: null
    });

    const [NFTTransfers, updateNFTTransfers] = useState({
        information: null
    });

    const [NFTOwners, updateNFTOwners] = useState({
        information: null
    });

    const [NFTTrades, updateNFTTrades] = useState({
        information: null
    });

    const [NFTLowestPrice, updateNFTLowestPrice] = useState({
        information: null
    });

    const clearHandler = () => { // Clear data if there is an error, function to be invoked
        updateNFTData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTTransfers((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTOwners((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTTrades((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });

        updateNFTLowestPrice((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

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
            // Collection Data
            axios.get(MORALIS_URL + "/" + tokenAddress, options) // NFT endpoint for retrieving information related to collection
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, clear data
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTData((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => {
                clearHandler();
                setAlert(true);
            });

            // Lowest Price Data
            axios.get(MORALIS_URL + "/" + tokenAddress + LOWESTPRICE_ENDPOINT, options) // NFT endpoint for retrieving information related to collection
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && Object.keys(response).length === 0){ // If empty, clear
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTLowestPrice((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => {
                clearHandler();
                setAlert(true);
            });

            // NFT Transfers Data
            axios.get(MORALIS_URL + "/" + tokenAddress + TRANSFERS_ENDPOINT, options) // NFT endpoint for retrieving information related to collection
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, clear data
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => {
                clearHandler();
                setAlert(true);
            });

            // Owners Data
            axios.get(MORALIS_URL + "/" + tokenAddress + OWNERS_ENDPOINT, options) // NFT endpoint for retrieving information related to collection
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, clear data
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTOwners((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => {
                clearHandler();
                setAlert(true);
            });

            // Trades Data
            axios.get(MORALIS_URL + "/" + tokenAddress + TRADES_ENDPOINT, options) // NFT endpoint for retrieving information related to collection
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, clear data
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateNFTTrades((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => {
                clearHandler();
                setAlert(true);
            });            
        }
        else {
            updateAlert(true); // Set Alert
            clearHandler();
        }
    }

        return (
            <div className="erc721-collection-page">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">ERC721 Analytics</h1>
                    </div>
                    { setAlert ? <Alert type='danger' /> : null }
                    <p style={{marginTop: '3rem'}}>Enter Contract Address of an <b>ERC721</b> token for analytics (limited to 100)</p>
                    <form onSubmit={formHandler}>
                        <input style={{marginRight: '2rem'}} onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                        <button type='submit' class='btn btn-success'>Submit</button>
                    </form>
                </main>
                <main style={{marginTop: '3rem'}} role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    { NFTData.information === null ? null : <h4>NFT Collection Name: <b>{ NFTData.information.result[0].name }</b></h4>}
                    { NFTData.information === null ? null : <h4>Contract Address: <b>{ tokenAddress }</b></h4>} 
                    { NFTData.information === null ? null : <h4>Total Items: <b>{ NFTData.information.total }</b></h4>} 
                </main>
                <main role="main">
                    { NFTLowestPrice.information === null ? null : <ERC721LowestCollectionPriceInfoTable data={ NFTLowestPrice.information } />} 
                </main>
                <main style={{marginTop: '3rem'}} role="main">
                    { NFTData.information === null ? null : <ERC721CollectionDataInfoTable quantity={ NFTData.information.total } data={ NFTData.information.result } />} 
                </main>
                <main style={{marginTop: '3rem'}} role="main">
                    { NFTTransfers.information === null ? null : <ERC721CollectionTransferInfoTable quantity={ NFTTransfers.information.total } data={ NFTTransfers.information.result } />} 
                </main>
                <main style={{marginTop: '3rem'}} role="main">
                    { NFTOwners.information === null ? null : <ERC721CollectionOwnerInfoTable data={ NFTOwners.information.result } />} 
                </main>
                <main style={{marginTop: '3rem'}} role="main">
                    { NFTTrades.information === null ? null : <ERC721CollectionTradeInfoTable quantity={ NFTTrades.information.total } data={ NFTTrades.information.result } />} 
                </main>
            </div>
        )
}

export default ERC721CollectionPage;