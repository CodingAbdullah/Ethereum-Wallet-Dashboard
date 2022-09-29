import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';
import ERC721LookupsInfoTable from '../ERC721LookupsInfoTable/ERC721LookupsInfoTable';
import ERC721TransferLookupsInfoTable from '../ERC721TransferLookupsInfoTable/ERC721TransferLookupsInfoTable';
import ERC721SalesLookupsInfoTable from '../ERC721SalesLookupsInfoTable/ERC721SalesLookupsInfoTable';
import ERC721RarityLookupsInfoTable from '../ERC721RarityLookupsInfoTable/ERC721RarityLookupsInfoTable';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import axios from 'axios';

const ERC721LookupsPage = () => {

    const [tokenAddress, updateTokenAddress] = useState(""); // Initialize ERC721 contract attributes
    const [tokenId, updateTokenId] = useState("");    
    const [setAlert, updateAlert] = useState(false);

    const [tokenData, updateTokenData] = useState({
        information: null
    });

    const [tokenTransfers, updateTokenTransfers] = useState({
        information: null
    });
    
    const [tokenRarity, updateTokenRarity] = useState({
        information: null
    });

    const navigate = useNavigate();

    const NODE_SERVER_URL = 'http://localhost:5000'; // API endpoints for ERC721 lookups
    const LOOKUP_ENDPOINT = '/erc721-lookup-by-id';
    const TRANSFER_LOOKUP_ENDPOINT = '/erc721-lookup-transfer-by-id';
    const RARITY_LOOKUP_ENDPOINT = '/erc721-lookup-rarity-by-id';

    const [networkID, updateNetworkID] = useState('eth'); // Network selector set to default value

    const updateNetworkHandler = (e) => {
        updateNetworkID(e.target.value);
    }

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

        updateTokenRarity((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }


    const tokenHandler = (e) => {
        e.preventDefault(); // Prevent Default Behaviour

        const options = {
            method: 'POST',
            body: JSON.stringify({ address: tokenAddress, id: tokenId }),
            headers: {
                'content-type' : 'application/json', 
            }
        }

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.post(NODE_SERVER_URL + LOOKUP_ENDPOINT , options)
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
                            information: response.data.information
                        }
                    });
                }
            })

            axios.post(NODE_SERVER_URL + TRANSFER_LOOKUP_ENDPOINT, options) // Get transfer data
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
                    if (response.status === 200 && response.data.information.result.length === 0){ // If empty, keep state to null
                        updateTokenTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateTokenTransfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information.result // If data exists, add it to state
                            }
                        });
                    }
                }
            })

            axios.post(NODE_SERVER_URL + RARITY_LOOKUP_ENDPOINT, options) // API endpoint for finding collection rarity
            .then(response => {
                console.log(response); 
                updateTokenRarity((prevState) => {
                    return {
                        ...prevState,
                        information: response.data.information
                    }
                });
            })
            .catch((e) => console.log(e));
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
                <form onSubmit={ tokenHandler }>
                    <p style={{ marginRight: '0.5rem' }}>Enter ERC721 Contract Address & Token ID for Lookup </p>
                    <input style={{ marginTop: '1rem' }} type="text" onChange={e => updateTokenAddress(e.target.value)} placeholder="Enter ERC721 Contract Address" required />
                    <br />
                    <input style={{marginTop: '1rem' }} type="number" onChange={e => updateTokenId(e.target.value)} placeholder="Enter Token ID" required />
                    <br />
                    <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                    <button style={{marginTop: '2rem' }} type="submit" class="btn btn-success">Lookup</button>
                </form>
                    <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                    <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={() => { 
                        updateAlert(false); 
                        updateTokenData((prevState) => { return { ...prevState, information: null }}); 
                        updateTokenTransfers((prevState) => { return { ...prevState, information: null }}); 
                    }}>Clear</button>
                </div>
                <div style={{ marginTop: '2rem'}}>
                    { tokenData.information === null ? <div /> : <div style={{ marginLeft: '2rem' }}><ERC721LookupsInfoTable data={ tokenData.information } /></div> }
                </div>
                <div>
                    { tokenRarity.information === null ? <div /> : <ERC721RarityLookupsInfoTable data={ tokenRarity.information } /> }
                </div>
                <div>
                    { tokenTransfers.information === null ? <div /> : <ERC721TransferLookupsInfoTable data={ tokenTransfers.information } /> }
                </div>
                <div>
                    { tokenData.information === null ? <div /> : <ERC721SalesLookupsInfoTable address={ tokenAddress } tokenId={ tokenId } /> }
                </div>
            </main>
        </div>
    )

}

export default ERC721LookupsPage;