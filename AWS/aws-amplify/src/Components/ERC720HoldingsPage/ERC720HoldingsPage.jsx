import React, { useState } from 'react';
import Alert from '../Alert/Alert';
import ERC720HoldingsInfoTable from '../ERC720HoldingsInfoTable/ERC720HoldingsInfoTable';
import ERC720TransfersInfoTable from '../ERC720TransfersInfoTable/ERC720TransfersInfoTable';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import { useNavigate } from 'react-router';
import axios from 'axios';

const ERC720HoldingsPage = () => {
    // Incorporating state management for wallet address, alerts, and ERC20 token holdings/transfers
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

    const NODE_SERVER_URL = "https://18.221.208.44.nip.io"; // AWS EC2 Node Server URL
    const ERC20TOKEN_ENDPOINT = '/address-erc20-holdings';

    const ERC20TOKENTRANSFERS_ENDPOINT = '/address-erc20-transfers';

    const [networkID, updateNetworkID] = useState('eth'); // Network selector set to default value

    const updateNetworkHandler = e => {
        updateNetworkID(e.target.value);
    }

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

    const walletHandler = e => {
        e.preventDefault();

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x') {          
            // Set options for fetch and flight responses
            const options = {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({ address: walletAddress, network : networkID }),
                headers: {
                    'content-type' : 'application/json', 
                }
            }

            axios.post(NODE_SERVER_URL + ERC20TOKEN_ENDPOINT, options) // ERC20 endpoint for retrieving information related to holdings
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateEmptyAlert(false);
                    clearHandler();
                }
                else {
                    if (response.status === 200 && response.data.information.length === 0){ // If empty, display warning
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
                                information: response.data.information
                            }
                        });
                    }
                }
            });

            // Get ERC20Transfers of particular wallet
            axios.post(NODE_SERVER_URL + ERC20TOKENTRANSFERS_ENDPOINT, options)
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
                    if (response.status === 200 && response.data.information.result.length === 0){ // If empty, keep state to null
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
                                information: response.data.information.result // If data exists, add it to state
                            }
                        });
                    }
                }
            });
        }
        else {
            updateAlert(true); // Set Alert
            updateEmptyAlert(false); // Remove redundant alerts, and empty data
            clearHandler();
        }
    } 

    if (isEmpty || setAlert) {
        return (
            <div className="erc-721-token-page">
                <main role="main" class="p-3">
                    <div>
                        <h1>ERC20 Token Holdings</h1>
                        <hr />
                    </div>
                    { setAlert ? <Alert type="danger" /> : null }
                    { isEmpty ? <Alert type="warning" /> : null }
                    <div class="jumbotron">
                        <div class="container">
                            <form onSubmit={ walletHandler }>
                                <p class="lead text-muted"><i>Enter wallet address to check ERC20 holdings</i></p>
                                <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="text" onChange={ e => updateWalletAddress(e.target.value) } placeholder="Enter wallet address" required />
                                <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                                <button style={{ marginTop: '2rem' }} type="submit" class="btn btn-success">Check Balances</button>
                            </form>
                            <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={ () => navigate("/") }>Go Home</button>
                            <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={ () => { updateAlert(false); updateEmptyAlert(false); updateERC20Holdings((prevState) => { return { ...prevState, information: null }}); updateERC20Transfers((prevState) => { return { ...prevState, information: null }} )} }>Clear</button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }
    else {
        return (
                <div className="erc-721-token-page">
                    <main role="main" class="p-3">
                        <div>
                            <h1>ERC20 Token Holdings</h1>
                            <hr />
                        </div>
                        <div class="jumbotron">
                            <div class="container">
                                <form onSubmit={walletHandler}>
                                    <p class="lead text-muted"><i>Enter wallet address to check ERC20 holdings</i></p>
                                    <input class="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }} type="text" onChange={e => updateWalletAddress(e.target.value)} placeholder="Enter wallet address" required />
                                    <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                                    <button style={{marginTop: '2rem'}} type="submit" class="btn btn-success">Check Balances</button>
                                </form>
                                <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                                <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={() => { updateAlert(false); updateEmptyAlert(false); updateERC20Holdings((prevState) => { return { ...prevState, information: null }}); updateERC20Transfers((prevState) => { return { ...prevState, information: null }} )}}>Clear</button>
                            </div>
                        </div>
                        {
                            ERC20Holdings.information === null ? null :
                                <>
                                    <ERC720HoldingsInfoTable address={ walletAddress } data={ERC20Holdings.information} />
                                </>
                        }
                    </main>
                    {
                        ERC20Transfers.information === null ? null :
                            <>
                                <ERC720TransfersInfoTable address={walletAddress} data={ERC20Transfers.information} />
                            </>
                    }
                </div>  
        )
    }
}

export default ERC720HoldingsPage;