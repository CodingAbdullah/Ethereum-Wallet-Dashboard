import React, { useState }from 'react';
import Alert from '../Alert/Alert';
import ERC721HoldingsInfoTable from '../ERC721HoldingsInfoTable/ERC721HoldingsInfoTable';
import ERC721TransfersInfoTable from '../ERC721TransfersInfoTable/ERC721TransfersInfoTable';
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

    const URL = "https://deep-index.moralis.io/api/v2/";
    const NFT_ENDPOINT = '/nft?chain=eth&format=decimal';
    const NFT_TRANSFERS_ENDPOINT = '/nft/transfers?chain=eth&format=decimal&direction=both';

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
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
                'access-control-allow-origin': '*',
                'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Transpose API key hidden 
            }
        }

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            axios.get(URL + walletAddress + NFT_ENDPOINT, options) // NFT endpoint for retrieving information related to holdings
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
                    if (response.status === 200 && response.data.total === 0){ // If empty, display warning
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
                                information: response.data
                            }
                        });
                    }
                }
            })

            axios.get(URL + walletAddress + NFT_TRANSFERS_ENDPOINT, options)
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
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, keep state to null
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
                                information: response.data.result // If data exists, add it to state
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
                    <h2>ERC721 Token Data</h2>
                </div>
                { setAlert ? <Alert type="danger" /> : null }
                { isEmpty ? <Alert type="warning" /> : null }
                <div class="jumbotron">
                    <div class="container">
                        <form onSubmit={walletHandler}>
                            <label style={{marginRight: '0.5rem'}}>Enter Wallet Address (Top 100 NFTs/Transfers will be displayed): </label>
                            <input type="text" onChange={e => updateWalletAddress(e.target.value)} placeholder="Enter here" required />
                            <br />
                            <button style={{marginTop: '2rem'}} type="submit" class="btn btn-success">Check Data</button>
                        </form>
                        <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                        <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={() => { updateAlert(false); updateEmptyAlert(false); updateNFTData((prevState) => { return { ...prevState, information: null }}); updateERC721Transfers((prevState) => { return { ...prevState, information: null }})} }>Clear</button>
                    </div>
                </div>
                { nftData.information != null ? <hr style={{marginTop: '5rem', marginBottom: '5rem'}} /> : null }
                {nftData.information !== null ? <h5 style={{marginTop: '2rem'}}>ERC721 Token Holdings for Wallet: <b>{walletAddress}</b></h5> : null}
                <div style={{marginTop: '2rem'}}>
                    { nftData.information === null ? <div /> : <ERC721HoldingsInfoTable data={nftData.information} /> }
                </div>
            </main>
            <main role="main">
                { nftData.information != null ? <hr style={{marginTop: '5rem'}} /> : null }
                <div style={{marginTop: '5rem', marginLeft: '5rem'}}>
                    { ERC721Transfers.information === null ? <div /> : <h5 style={{marginLeft: '8rem'}}>ERC721 Transfers for: <b>{walletAddress}</b></h5> } 
                    { ERC721Transfers.information === null ? <div /> : <ERC721TransfersInfoTable address={walletAddress} data={ERC721Transfers.information} /> }
                </div>
            </main>
        </div>  
    )
}

export default ERC721HoldingsPage;