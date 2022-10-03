import React, { useState }from 'react';
import Alert from '../Alert/Alert';
import ERC721HoldingsInfoTable from '../ERC721HoldingsInfoTable/ERC721HoldingsInfoTable';
import ERC721TransfersInfoTable from '../ERC721TransfersInfoTable/ERC721TransfersInfoTable';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import { useNavigate } from 'react-router';
import axios from 'axios';

const ERC721HoldingsPage = () => {

    const [walletAddress, updateWalletAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const [isEmpty, updateEmptyAlert] = useState(false);
    const [nftData, updateNFTData] = useState({
        information: null
    });

    const [ERC721Transfers, updateERC721Transfers] = useState({
        information: null
    });

    const navigate = useNavigate();

    const NODE_SERVER_URL = "http://localhost:5000"; // Modifying end points for the backend server
    const NFT_ENDPOINT = '/address-erc721-holdings';
    const NFT_TRANSFERS_ENDPOINT = '/address-erc721-transfers';

    const [networkID, updateNetworkID] = useState('eth'); // Network selector set to default value

    const updateNetworkHandler = (e) => {
        updateNetworkID(e.target.value); // Adding state to track network ID 
    }

    const clearHandler = () => {
        updateNFTData((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateERC721Transfers((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    const walletHandler = (e) => {
        e.preventDefault();

        // Set options for fetch and flight responses
        const options = {
            method: 'POST',
            body: JSON.stringify({ address: walletAddress, network: networkID }),
            headers: {
                'content-type' : 'application/json', 
            }
        }

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            axios.post(NODE_SERVER_URL + NFT_ENDPOINT, options) // NFT endpoint for retrieving information related to holdings
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateEmptyAlert(false);
                    updateNFTData((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.information.total === 0){ // If empty, display warning
                        updateEmptyAlert(true);
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
                        updateEmptyAlert(false);

                        updateNFTData((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                    }
                }
            })

            axios.post(NODE_SERVER_URL + NFT_TRANSFERS_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateERC721Transfers((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.information.result.length === 0){ // If empty, keep state to null
                        updateERC721Transfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateERC721Transfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information.result // If data exists, add it to state
                            }
                        });
                    }
                }
            })
        }
        else {
            updateAlert(true); // Set Alert
            updateEmptyAlert(false); // Remove redundant alerts, and empty data
            clearHandler();
        }
    }   
    return (
        <div className="erc-721-token-page">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC-721 Token Holdings</h2>
                    <label>{networkID}</label>
                </div>
                { setAlert ? <Alert type="danger" /> : null }
                { isEmpty ? <Alert type="warning" /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={ walletHandler }>
                            <label style={{ marginRight: '0.5rem' }}>Enter Wallet Address (Top 100 NFTs/Transfers will be displayed): </label>
                            <input type="text" onChange={e => updateWalletAddress(e.target.value)} placeholder="Enter here" required />
                            <br />
                            <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                            <button style={{ marginTop: '2rem' }} type="submit" class="btn btn-success">Check Data</button>
                        </form>
                        <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={() => { updateAlert(false); updateEmptyAlert(false); updateNFTData((prevState) => { return { ...prevState, information: null }}); updateERC721Transfers((prevState) => { return { ...prevState, information: null }})} }>Clear</button>
                    </div>
                </div>
            </main>
            <main style={{marginTop: '-3rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                    <div>
                        {
                            nftData.information === null ? null :
                                <>
                                    <main style={{marginTop: '5rem'}} role="main">
                                        <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                            <h3 class="h3">ERC-721 Token Holdings</h3>
                                        </div>
                                    </main>
                                    <ERC721HoldingsInfoTable data={ nftData.information } />
                                </>
                        }
                    </div>
            </main>
            <main style={{marginTop: '2rem'}} class="col-md-9 ml-sm-auto col-lg-10 px-md-4" role="main">
                <div>
                    {
                        ERC721Transfers.information === null ? null :
                            <>
                                <main style={{marginTop: '5rem'}} role="main">
                                    <div style={{marginTop: '1rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                        <h3 class="h3">Sample ERC-721 Transfers</h3>
                                    </div>
                                </main>
                                <ERC721TransfersInfoTable address={ walletAddress } data={ ERC721Transfers.information } />
                            </>
                    }
                </div>
            </main>
        </div>  
    )
}

export default ERC721HoldingsPage;