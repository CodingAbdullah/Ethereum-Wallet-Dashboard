import React, { useState }from 'react';
import Alert from '../Alert/Alert';
import ERC720HoldingsInfoTable from '../ERC720HoldingsInfoTable/ERC720HoldingsInfoTable';
import ERC720TransfersInfoTable from '../ERC720TransfersInfoTable/ERC720TransfersInfoTable';
import { useNavigate } from 'react-router';
import axios from 'axios';

const ERC720Holdings = () => {

    const [walletAddress, updateWalletAddress] = useState("");
    const [setAlert, updateAlert] = useState(false);

    const [isEmpty, updateEmptyAlert] = useState(false);
    const [ERC20Holdings, updateERC20Holdings] = useState({
        information: null
    });

    const [ERC20Transfers, updateERC20Transfers] = useState({
        information: null
    });

    const navigate = useNavigate();

    const URL = "https://deep-index.moralis.io/api/v2/";
    const ERC20TOKEN_ENDPOINT = '/erc20?chain=eth';

    const ERC20TOKENTRANSFERS_ENDPOINT = '/erc20/transfers?chain=eth';

    const clearHandler = () => {
        updateERC20Holdings((prevState) => { // Removing information, when invalid address is added
            return {
                ...prevState,
                information: null
            }
        });
        updateERC20Transfers((prevState) => {
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
                'X-API-KEY' : process.env.REACT_APP_MORALIS_API_KEY // Moralis API key hidden 
            }
        }

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            axios.get(URL + walletAddress + ERC20TOKEN_ENDPOINT, options) // ERC20 endpoint for retrieving information related to holdings
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateEmptyAlert(false);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.length === 0){ // If empty, display warning
                        updateEmptyAlert(true);
                        updateAlert(false);
                        clearHandler();
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateEmptyAlert(false);

                        updateERC20Holdings((prevState) => {
                            return {
                                ...prevState,
                                information: response.data
                            }
                        });
                    }
                }
            })
            .catch(err => console.log(err));

            // Get ERC20Transfers of particular wallet
            axios.get(URL + walletAddress + ERC20TOKENTRANSFERS_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateERC20Transfers((prevState) => {
                        return {
                            ...prevState,
                            information: null
                        }
                    });
                }
                else {
                    if (response.status === 200 && response.data.result.length === 0){ // If empty, keep state to null
                        updateERC20Transfers((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateERC20Transfers((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.result // If data exists, add it to state
                            }
                        });
                    }
                }
            })
            .catch(err => {console.log(err)})
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
                { setAlert ? <Alert type="danger" /> : null }
                { isEmpty ? <Alert type="warning" /> : null }
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2>ERC20 Token Data</h2>
                </div>
                <form onSubmit={walletHandler}>
                    <label style={{marginRight: '0.5rem'}}>Enter Wallet Address (ERC20 token balances/transfers in this wallet will be displayed (100 Recent): </label>
                    <input type="text" onChange={e => updateWalletAddress(e.target.value)} placeholder="Enter here" required />
                    <br />
                    <button style={{marginTop: '3rem'}} type="submit" class="btn btn-primary">Check Balances</button>
                </form>
                <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-success' onClick={() => navigate("/")}>Go Home</button>
                <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={() => { updateAlert(false); updateEmptyAlert(false); updateERC20Holdings((prevState) => { return { ...prevState, information: null }}); updateERC20Transfers((prevState) => { return { ...prevState, information: null }} )}}>Clear</button>
                { ERC20Holdings.information !== null ? <h5 style={{marginTop: '2rem'}}>ERC720 Token Holdings for Wallet: <b>{walletAddress}</b></h5> : null }
                <div style={{marginTop: '2rem'}}>
                    { ERC20Holdings.information === null ? <div /> : <ERC720HoldingsInfoTable data={ERC20Holdings.information} /> }
                </div>
            </main>
            <main role="main">
                <div style={{marginTop: '5rem', marginLeft: '5rem'}}>
                    {ERC20Transfers.information === null ? <div /> : <h5 style={{marginLeft: '8rem'}}>ERC20 Transfers for Wallet: <b>{walletAddress}</b></h5>}
                    { ERC20Transfers.information === null ? <div /> : <ERC720TransfersInfoTable address={walletAddress} data={ERC20Transfers.information} /> }
                </div>
            </main>

        </div>  
    )
}

export default ERC720Holdings;