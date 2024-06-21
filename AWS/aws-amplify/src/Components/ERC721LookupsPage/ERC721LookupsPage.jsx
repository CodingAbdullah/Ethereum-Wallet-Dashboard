import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';
import ERC721LookupsInfoTable from '../ERC721LookupsInfoTable/ERC721LookupsInfoTable';
import ERC721TransferLookupsInfoTable from '../ERC721TransferLookupsInfoTable/ERC721TransferLookupsInfoTable';
import ERC721SalesLookupsInfoTable from '../ERC721SalesLookupsInfoTable/ERC721SalesLookupsInfoTable';
import ERC721RarityLookupsInfoTable from '../ERC721RarityLookupsInfoTable/ERC721RarityLookupsInfoTable';
import ERC721LookupsOpenseaProfile from '../ERC721LookupsOpenseaProfile/ERC721LookupsOpenseaProfile';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import axios from 'axios';

const ERC721LookupsPage = () => {

    const [tokenAddress, updateTokenAddress] = useState(""); // Initialize ERC721 contract attributes
    const [tokenId, updateTokenId] = useState("");    
    const [setAlert, updateAlert] = useState(false);
    const [emptyAlert, updateEmptyAlert] = useState(false);

    const [tokenData, updateTokenData] = useState({
        information: null
    });

    const [openseaTokenData, updateOpenseaTokenData] = useState({
        information: null 
    });

    const [tokenTransfers, updateTokenTransfers] = useState({
        information: null
    });
    
    const [tokenRarity, updateTokenRarity] = useState({
        information: null
    });

    const navigate = useNavigate();

    const NODE_SERVER_URL = "http://localhost:5000"; // AWS EC2 Node Server URL
    const LOOKUP_ENDPOINT = '/erc721-lookup-by-id';
    const OPENSEA_TOKEN_LOOKUP_ENDPOINT = '/erc721-lookup-opensea-information';
    const TRANSFER_LOOKUP_ENDPOINT = '/erc721-lookup-transfer-by-id';
    const RARITY_LOOKUP_ENDPOINT = '/erc721-lookup-rarity-by-id';
    
    const [networkID, updateNetworkID] = useState('eth'); // Network selector set to default value

    const updateNetworkHandler = (e) => {
        updateNetworkID(e.target.value); // Adding state to track network ID  
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

        updateOpenseaTokenData((prevState) => {
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
            mode: 'cors',
            body: JSON.stringify({ address: tokenAddress, id: tokenId, network: networkID }),
            headers: {
                'content-type' : 'application/json', 
            }
        }

        if (tokenAddress.length === 42 && tokenAddress.substring(0, 2) === '0x'){
            axios.post(NODE_SERVER_URL + LOOKUP_ENDPOINT , options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateEmptyAlert(false);
                    clearHandler();
                }
                else {
                    updateAlert(false); // Remove alerts if any exist
                    updateEmptyAlert(false);
                    updateTokenData((prevState) => {
                        return {
                             ...prevState,
                            information: response.data.information
                        }
                    });
                }
            })
            .catch(() => {
                clearHandler();
                updateEmptyAlert(true);
                updateAlert(false);
            });

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
            .catch(() => {
                updateTokenTransfers((prevState) => {
                    return {
                        ...prevState,
                        information: null
                    }
                });
            });

            axios.post(NODE_SERVER_URL + RARITY_LOOKUP_ENDPOINT, options) // API endpoint for finding collection rarity
            .then(response => {
                updateTokenRarity((prevState) => {
                    return {
                        ...prevState,
                        information: response.data.information
                    }
                });
            })
            .catch(() => {
                updateTokenRarity((prevState) => {
                    return {
                        ...prevState,
                        information: null
                    }
                });
            });

            // Request ERC721 token information from the OpenSea API
            axios.post(NODE_SERVER_URL + OPENSEA_TOKEN_LOOKUP_ENDPOINT , options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateEmptyAlert(false);
                    clearHandler();
                }
                else {
                    updateAlert(false); // Remove alerts if any exist
                    updateEmptyAlert(false);
                    updateOpenseaTokenData((prevState) => {
                        return {
                             ...prevState,
                            information: response.data.information
                        }
                    });
                }
            })
            .catch(() => {
                clearHandler();
                updateEmptyAlert(true);
                updateAlert(false);
            });
        }
        else {
            updateAlert(true);
            updateEmptyAlert(false);
            clearHandler();
        }
    }

    return (
        <div>
             <main role="main" class="p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC721 Token Lookup</h2>
                </div>
                { setAlert ? <Alert type="danger" /> : null }
                <div class="jumbotron">                    
                <form onSubmit={ tokenHandler }>
                    <p>Enter ERC721 contract address & token ID for information</p>
                    <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="text" onChange={e => updateTokenAddress(e.target.value)} placeholder="Enter contract address" required />
                    <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="number" onChange={e => updateTokenId(e.target.value)} placeholder="Enter token ID" required />
                    <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                    <button style={{marginTop: '2rem' }} type="submit" class="btn btn-success">Lookup</button>
                </form>
                    <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                    <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={() => { 
                        updateAlert(false); 
                        updateOpenseaTokenData((prevState) => { return { ...prevState, information: null }}); 
                        updateTokenData((prevState) => { return { ...prevState, information: null }}); 
                        updateTokenTransfers((prevState) => { return { ...prevState, information: null }});
                        updateTokenRarity((prevState) => { return { ...prevState, information: null }}); 
                        updateEmptyAlert(false);
                    }}>Clear</button>
                </div>
            </main>
            { 
                emptyAlert ? 
                    <main role="main" class="p-3">
                        <Alert type="warning-unavailable-testnet" /> 
                    </main>
                : null 
            }
            <main style={{ marginTop: emptyAlert ? '' : '-3rem' }} class="p-3" role="main">
                    <div>
                        {
                            tokenData.information === null ? null :
                                <>
                                    <ERC721LookupsInfoTable address={ tokenAddress } data={ tokenData.information } />                                
                                </>
                        }
                    </div>
            </main>
            <main class="p-3" role="main">
                    <div>
                        {
                            openseaTokenData.information === null ? null :
                                openseaTokenData.information.length === 0 ? null : 
                                (
                                    <>
                                        <ERC721LookupsOpenseaProfile openseaTokenData={ openseaTokenData.information[0] } />
                                    </>
                                )
                        }
                    </div>
            </main>
            <main class="p-3" role="main">
                    <div>
                        {
                            tokenRarity.information === null ? null :
                                tokenRarity.information.data === null ? null : 
                                (
                                    <>
                                        <ERC721RarityLookupsInfoTable address={ tokenAddress } data={ tokenRarity.information } />
                                    </>
                                )
                        }
                    </div>
            </main>
            <main class="p-3" role="main">
                    <div>
                        {
                            tokenTransfers.information === null ? null :
                                <>
                                    <ERC721TransferLookupsInfoTable address={ tokenAddress } data={ tokenTransfers.information } />
                                </>
                        }
                    </div>
            </main>
            <main class="p-3" role="main">
                    <div>
                        {
                            tokenData.information === null ? null :
                                networkID !== 'eth' ? null : 
                                (
                                    <>
                                        <ERC721SalesLookupsInfoTable address={ tokenAddress } tokenId={ tokenId } />                                
                                    </>
                                )
                        }
                    </div>
            </main>
        </div>
    )
}

export default ERC721LookupsPage;