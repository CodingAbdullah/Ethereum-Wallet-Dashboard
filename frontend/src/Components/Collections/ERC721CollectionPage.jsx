import React, { useState } from 'react';
import axios from 'axios';
import Alert from '../Alert/Alert';

const ERC721CollectionPage = () => {

    const [tokenAddress, updateTokenAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const URL = 'https://deep-index.moralis.io/api/v2/'; // API endpoints for NFT lookup
    const LOOKUP_ENDPOINT = 'nft/';

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
                    updateNFTData((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, display warning
                        updateAlert(false);
                        updateNFTData((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
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
            .catch(err => console.log(err));

            axios.get(URL + tokenAddress + LOOKUP_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateNFTData((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, keep state to null
                        updateNFTData((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateNFTData((prevState) => {
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

    if (NFTData.information === null || NFTTransfers.information === null || NFTOwners.information === null || NFTTrades.information === null || NFTLowestPrice.information === null) {
        return <div>Loading...</div>
    }
    else {
        return (
            <div className="erc721-collection-page">
                { setAlert ? <Alert type='danger' /> : null }
                <form onSubmit={formHandler}>
                    <label>Enter NFT Contract Address for Analytics</label><br />
                    <input onChange={e => updateTokenAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                    <button type='submit' class='btn btn-success'>Submit</button>
                </form>
            </div>
        )
    }
}

export default ERC721CollectionPage;