import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Alert from '../Alert/Alert';
import TransactionsInfoTable from '../TransactionsInfoTable/TransactionsInfoTable';
import ERC720HoldingsInfoTable from '../ERC720HoldingsInfoTable/ERC720HoldingsInfoTable';
import ERC721HoldingsInfoTable from '../ERC721HoldingsInfoTable/ERC721HoldingsInfoTable';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import TransactionBalanceSection from '../TransactionBalanceSection/TransactionBalanceSection';

const WalletStats = () => {
    const [setAlert, updateAlert] = useState(false);
    const [emptyTransactionAlert, updateTransactionAlert] = useState(false);
    const [emptyERC20Alert, updateERC20Alert] = useState(false);
    const [emptyERC721Alert, updateERC721Alert] = useState(false);
    const [networkID, updateNetworkID] = useState('eth');

    const [walletAddress, updateWalletAddress] = useState("");
    
    const navigate = useNavigate();

    const [amount, updateAmount] = useState(-1);

    const [ethPrice, updateEthPrice] = useState({
        information: null
    });

    const [maticPrice, updateMaticPrice] = useState({
        information: null
    });

    const [transactions, updateTransactions] = useState({
        information: null
    });

    const [ERC20Holdings, updateERC20Holdings] = useState({
        information: null
    });

    const [ERC721Holdings, updateERC721Holdings] = useState({
        information: null
    });

    // Endpoints and URLs
    const NODE_SERVER_URL = 'http://localhost:5000';
    const COIN_GECKO_URL = "https://api.coingecko.com/api/v3";
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const QUERY_STRING_MATIC_NETWORK = "?ids=matic-network&vs_currencies=usd&include_24hr_change=true";

    const TRANSACTION_DETAIL_ENDPOINT = "/address-transaction-details";
    const ADDRESS_ERC20HOLDINGS_ENDPOINT = '/address-erc20-holdings';
    const API_ENDPOINT = "/simple/price";
    const ADDRESS_ERC721HOLDINGS_ENDPOINT = "/address-erc721-holdings";
    const ADDRESS_DETAILS_ENDPOINT = "/address-details";

    const alertHandler = () => { // Clear data upon error
        updateAmount(-1);
        updateEthPrice((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateMaticPrice((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateTransactions((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateERC20Holdings((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
        updateERC721Holdings((prevState) => {
            return {
                ...prevState,
                information: null
            }
        });
    }

    const clearHandler = () => {
        // Clear out errors and alerts
        alertHandler();
        updateAlert(false);
        updateTransactionAlert(false);
        updateERC20Alert(false);
        updateERC721Alert(false);
    }

    const updateNetworkHandler = (e) => {
        updateNetworkID(e.target.value);
    }

    const formHandler = (e) => {   
        e.preventDefault(); 

        // Set options for fetch and flight responses
        const options = {
            method: 'POST',
            body: JSON.stringify({ address: walletAddress, network: networkID }),
            headers: {
                'content-type' : 'application/json' 
            }
        }

        // Gather wallet analytics using API resources and running checks to see if wallet address is valid
        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            axios.post(NODE_SERVER_URL + ADDRESS_DETAILS_ENDPOINT, options)
            .then(res => {
                if (res.data.information.message === 'OK'){
                    updateAmount(res.data.information.result);
                    updateAlert(false);
                }
                else {
                    // Valid length entered, but invalid address means invalid address, update alert, remove, data, remove other alerts
                    updateAlert(true);
                    updateERC20Alert(false);
                    updateERC721Alert(false);
                    updateTransactionAlert(false); 
                    alertHandler();              
                }
            });

                // ETH Price calculator
                fetch(COIN_GECKO_URL + API_ENDPOINT + QUERY_STRING_MATIC_NETWORK)
                .then(response => response.json())
                .then(res => {
                    if (res['matic-network'] !== undefined) {
                        updateMaticPrice((prevState) => { // Update MATIC price information
                            return {
                                ...prevState,
                                information: res
                            }
                        });
                    }
                });

                // ETH Price calculator
                fetch(COIN_GECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM)
                .then(response => response.json())
                .then(res => {
                    if (res.ethereum !== undefined) {
                        updateEthPrice((prevState) => { // Update ETH price information
                            return {
                                ...prevState,
                                information: res
                            }
                        });
                    }
                });

            // Transactions of a particular account, if the address of the particular one entered is valid
            axios.post(NODE_SERVER_URL + TRANSACTION_DETAIL_ENDPOINT , options)
            .then(res => {
                console.log(res);
                if (res.data.information.message === 'OK'){
                    updateTransactions((prevState) => { // Get Transaction data 
                        return {
                            ...prevState,
                            information: res.data.information
                        }
                    });
                }
                else {
                    alertHandler();
                    updateTransactionAlert(false);
                }

                if (res.data.information.result.length === 0) {
                    updateTransactionAlert(true);
                }
                else {
                    updateTransactionAlert(false);
                }
            });

            // ERC20 endpoint for retrieving information related to holdings
            axios.post(NODE_SERVER_URL + ADDRESS_ERC20HOLDINGS_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateERC20Alert(false);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.information.length === 0){ // If empty, display warning
                        updateERC20Alert(true);
                        updateAlert(false);
                        updateERC20Holdings((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateERC20Alert(false);
                        updateERC20Holdings((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                    }
                }
            });

            // ERC721 endpoint for retrieving information related to holdings
            axios.post(NODE_SERVER_URL + ADDRESS_ERC721HOLDINGS_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateERC721Alert(false);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.information.result.length === 0){ // If empty, display warning
                        updateERC721Alert(true);
                        updateAlert(false);
                        updateERC721Holdings((prevState) => {
                            return {
                                ...prevState,
                                information: null
                            }
                        });
                    }
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateERC721Alert(false);
                        updateERC721Holdings((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                    }
                }
            });
        }
        else {
            // Invalid address means invalid alert display, remove other alerts, clear data
            updateAlert(true);
            updateERC20Alert(false);
            updateERC721Alert(false);
            updateTransactionAlert(false);
            alertHandler();
        }
    }

    return (
        <div className="wallet-stats">
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h2 class="h2">Wallet Analytics</h2>
                    <label>{ networkID }</label>
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                    <div class="jumbotron">
                        <div class="container">
                            <p>Enter <b>wallet address</b> of your choice for analytics</p>
                            <form onSubmit={formHandler}>
                                <input onChange={e => updateWalletAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                                <br />
                                <NetworkSelector blockchainNetwork={ updateNetworkHandler } />
                                <button style={{ marginTop: '2rem' }} type='submit' class='btn btn-success'>Submit</button>
                            </form>
                            <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={clearHandler}>Clear</button> 
                        </div>
                    </div>  
                { 
                    amount < 0 ? null : 
                        <div style={{ marginTop: '2rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h3 class="h3"> Balance Information</h3>
                        </div> 
                }  
                { ( ethPrice.information === null || maticPrice.information === null || amount < 0 ) ? null : <TransactionBalanceSection address={ walletAddress } amountValue = { amount } coinAction={ networkID.split("-")[0] === 'polygon' ? maticPrice : ethPrice } blockchainNetwork={ networkID } /> } 
                { 
                    transactions.information !== null  || emptyTransactionAlert ? 
                        <div style={{ marginTop: '3rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h3 class="h3">Transactions (Up to 1000)</h3>
                        </div> : null 
                }
                <div>
                    { emptyTransactionAlert && !setAlert ? <Alert type="warning" /> : ( transactions.information !== null ? <div style={{ marginLeft: '5rem' }}><TransactionsInfoTable walletAddress={ walletAddress } isMatic={networkID.split("-")[0] === 'polygon' ? true : false } data={ transactions.information.result } /></div> : null ) }
                </div>
                { 
                    ERC20Holdings.information !== null || emptyERC20Alert ? 
                        <div style={{ marginTop: '2rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h3 class="h3">ERC20 Holdings</h3>
                        </div> : null 
                }
                <div style={{ marginTop: '2rem' }}>
                    { ERC20Holdings.information === null && emptyERC20Alert ? <Alert type="warning" /> : ( ERC20Holdings.information !== null ? <div style={{ marginLeft: '10rem' }}><ERC720HoldingsInfoTable data={ ERC20Holdings.information } /></div>  : null ) }
                </div>
                { 
                    ERC721Holdings.information !== null || emptyERC721Alert ? 
                        <div style={{ marginTop: '2rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h3 class="h3">ERC721 Holdings</h3>
                        </div> : null 
                }
                <div style={{ marginTop: '2rem' }}>
                    { ERC721Holdings.information === null  && emptyERC721Alert ? <Alert type='warning' /> : ( ERC721Holdings.information !== null ? <div style={{ marginLeft: '18.5rem' }}><ERC721HoldingsInfoTable data={ ERC721Holdings.information } /></div> : null ) }
                </div>
            </main>
        </div>
    )
}

export default WalletStats;