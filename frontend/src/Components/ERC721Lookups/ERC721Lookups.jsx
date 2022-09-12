import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';
import ERC721LookupsInfoTable from '../ERC721LookupsInfoTable/ERC721LookupsInfoTable';
import ERC721TransferLookupsInfoTable from '../ERC721TransferLookupsInfoTable/ERC721TransferLookupsInfoTable';
import axios from 'axios';

const ERC721Lookups = () => {

    const [tokenAddress, updateTokenAddress] = useState(""); // Initialize ERC721 contract attributes
    const [tokenId, updateTokenId] = useState("");    
    const [setAlert, updateAlert] = useState(false);

    const [tokenData, updateTokenData] = useState({
        information: null
    });

    const [tokenTransfers, updateTokenTransfers] = useState({
        information: null
    });
    
    const navigate = useNavigate();

    const URL = 'https://deep-index.moralis.io/api/v2/'; // API endpoints for NFT lookup
    const LOOKUP_ENDPOINT = 'nft/';

    const clearHandler = () => {
        updateTokenData((prevState) => { // Reinstate errors if correct information is not entered
            return {
                ...prevState,
                information: null
            }
        });

        updateTokenTransfers((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }


    const tokenHandler = (e) => {
        e.preventDefault(); // Prevent Default Behaviour

        const options = {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
                'access-control-allow-origin': '*',
                'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Moralis API key hidden 
            }
        }

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.get(URL + LOOKUP_ENDPOINT + tokenAddress + "/" + tokenId + "?chain=eth&format=decimal", options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    clearHandler();
                }
                else {
                    updateAlert(false); // Remove alerts if any exist
                    updateTokenData((prevState) => {
                        return {
                             ...prevState,
                            information: response.data
                        }
                    });
                    console.log(response);
                }
            })
            .catch(err => console.log(err));

            axios.get(URL + LOOKUP_ENDPOINT + tokenAddress + "/" + tokenId + "/transfers?chain=eth&format=decimal", options)
            .then(response => {
                if (response.status !== 200){
                    updateTokenTransfers((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    })
                }
                else {
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, keep state to null
                        updateTokenTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        console.log(response);
                        updateTokenTransfers((prevState) => {
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
            updateAlert(true);
            clearHandler();
        }
    }

    return (
        <div>
             <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC721 Token Lookup</h2>
                </div>
                { setAlert ? <Alert type="danger" /> : null }
                <div class="jumbotron">                    
                <form onSubmit={tokenHandler}>
                    <p style={{marginRight: '0.5rem'}}>Enter ERC721 Contract Address & Token ID for Lookup </p>
                    <input style={{marginTop: '1rem'}} type="text" onChange={e => updateTokenAddress(e.target.value)} placeholder="Enter ERC721 Contract Address" required />
                    <br />
                    <input style={{marginTop: '1rem'}} type="number" onChange={e => updateTokenId(e.target.value)} placeholder="Enter Token ID" required />
                    <br />
                    <button style={{marginTop: '2rem'}} type="submit" class="btn btn-success">Lookup</button>
                </form>
                    <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                    <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={() => { 
                        updateAlert(false); 
                        updateTokenData((prevState) => { return { ...prevState, information: null }}); 
                        updateTokenTransfers((prevState) => { return { ...prevState, information: null}}); 
                    }}>Clear</button>
                </div>
                { tokenData.information !== null ? <h5 style={{marginTop: '2rem'}}>NFT Lookup</h5> : null }
                <div style={{marginTop: '2rem', marginLeft: '30px'}}>
                    { tokenData.information === null ? <div /> : <ERC721LookupsInfoTable data={tokenData.information} /> }
                </div>
                { tokenData.information === null || tokenTransfers.information === null ? null : <hr style={{marginTop: '3rem', marginBottom: '3rem'}} /> }
                { tokenTransfers.information !== null ? <h5 style={{marginTop: '2rem'}}>NFT Transfers Lookup</h5> : null }
                <div>
                    { tokenTransfers.information === null ? <div /> : <ERC721TransferLookupsInfoTable data={tokenTransfers.information} /> }
                </div>
            </main>
        </div>
    )

}

export default ERC721Lookups;