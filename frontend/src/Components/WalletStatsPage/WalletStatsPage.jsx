import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Alert from '../Alert/Alert';
import TransactionsInfoTable from '../TransactionsInfoTable/TransactionsInfoTable';
import ERC720HoldingsInfoTable from '../ERC720HoldingsInfoTable/ERC720HoldingsInfoTable';
import ERC721HoldingsInfoTable from '../ERC721HoldingsInfoTable/ERC721HoldingsInfoTable';

const WalletStats = () => {
    const [setAlert, updateAlert] = useState(false);
    const [emptyTransactionAlert, updateTransactionAlert] = useState(false);
    const [emptyERC20Alert, updateERC20Alert] = useState(false);
    const [emptyERC721Alert, updateERC721Alert] = useState(false);

    const [walletAddress, updateWalletAddress] = useState("");
    
    const navigate = useNavigate();

    const [amount, updateAmount] = useState(-1);
    const [ETHPrice, updateETHPrice] = useState({
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

    const MORALIS_URL = "https://deep-index.moralis.io/api/v2/";
    const ERC20TOKEN_ENDPOINT = '/erc20?chain=eth';
    const NFT_ENDPOINT = '/nft?chain=eth&format=decimal';
    const ETHPRICE_URL = "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const ETHERSCAN_URL = "https://api.etherscan.io/api";
    const mod = "account";
    const action = "balance";
    const tag = "latest";
    const API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
    const startBlock = 0;
    const endBlock = 99999999;
    const page = 1;
    const sort = 'desc';

    const alertHandler = () => { // Clear data upon error
        updateAmount(-1);
        updateETHPrice((prevState) => {
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

    const formHandler = (e) => {   
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

        // Gather wallet analytics using API resources and running checks to see if wallet address is valid
        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x'){
            fetch(ETHERSCAN_URL + "?module=" + mod + "&action=" + action + "&address=" + walletAddress + "&tag=" + tag + "&apikey=" + API_KEY)
            .then(response => response.json())
            .then(res => {
                if (res.message === 'OK'){
                    updateAmount(res.result);
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
            fetch(ETHPRICE_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM)
            .then(response => response.json())
            .then(res => {
                if (res.ethereum !== undefined) {
                    updateETHPrice((prevState) => { // Update ETH price information
                        return {
                            ...prevState,
                            information: res
                        }
                    });
                }
            });

            // Transactions of a particular account, if the address of the particular one entered is valid
            fetch(ETHERSCAN_URL + '?module=' + mod + "&action=txlist&address=" + walletAddress + "&startblock=" + startBlock 
            + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + API_KEY)
            .then(response => response.json())
            .then(res => {
                if (res.message === 'OK'){
                    updateTransactions((prevState) => { // Get Transaction data 
                        return {
                            ...prevState,
                            information: res
                        }
                    });
                }
                else {
                    alertHandler();
                    updateTransactionAlert(false);
                }

                if (res.result.length === 0) {
                    updateTransactionAlert(true);
                }
                else {
                    updateTransactionAlert(false);
                }
            });

            // ERC20 endpoint for retrieving information related to holdings
            axios.get(MORALIS_URL + walletAddress + ERC20TOKEN_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateERC20Alert(false);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.length === 0){ // If empty, display warning
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
                                information: response.data
                            }
                        });
                    }
                }
            });

            // NFT endpoint for retrieving information related to holdings
            axios.get(MORALIS_URL + walletAddress + NFT_ENDPOINT, options)
            .then(response => {
                if (response.status !== 200){
                    updateAlert(true);
                    updateERC721Alert(false);
                    alertHandler();
                }
                else {
                    if (response.status === 200 && response.data.total === 0){ // If empty, display warning
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
                                information: response.data
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
                </div>
                { setAlert ? <Alert type='danger' /> : null }
                    <div class="jumbotron">
                        <div class="container">
                            <p>Enter wallet address of your choice for analytics</p>
                            <form onSubmit={formHandler}>
                                <input onChange={e => updateWalletAddress(e.target.value)} type='text' placeholder='Enter Address Here'></input>
                                <br />
                                <button style={{marginTop: '2rem'}} type='submit' class='btn btn-success'>Submit</button>
                            </form>
                            <button style={{marginTop: '2rem', display: 'inline'}} class='btn btn-primary' onClick={() => navigate("/")}>Go Home</button>
                            <button style={{marginTop: '2rem', marginLeft: '2rem'}} class='btn btn-warning' onClick={clearHandler}>Clear</button> 
                        </div>
                    </div>  
                { amount < 0 ? null : 
                    <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3"> Balance Information</h3>
                    </div> 
                }  
                { amount >= 0 ? <h4 style={{marginTop: '1.5rem'}}><b>{"Account: " + walletAddress}</b></h4> : (walletAddress.length !== 0 && amount >= 0 ? <Alert type="warning" /> : null )}
                <h5><b>{ETHPrice.information !== null ? "ETH Balance: " + (amount*(1/1000000000000000000)) + " ETH (@ $" + ETHPrice.information.ethereum.usd.toFixed(2) + " USD/ETH)" : null}</b></h5>
                <h6><b>{ETHPrice.information !== null ? "Amount in USD: $" + ((amount*(1/1000000000000000000))*(ETHPrice.information.ethereum.usd)).toFixed(2) + " USD" : null}</b></h6>
                { transactions.information !== null  || emptyTransactionAlert ? 
                    <div style={{marginTop: '3rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">Transactions (Up to 1000)</h3>
                    </div> : null 
                }
                <div>
                    { emptyTransactionAlert && !setAlert ? <Alert type="warning" /> : ( transactions.information !== null ? <div style={{marginLeft: '5rem'}}><TransactionsInfoTable walletAddress={walletAddress} data={transactions.information.result} /></div> : null ) }
                </div>
                { ERC20Holdings.information !== null || emptyERC20Alert ? 
                    <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">ERC20 Holdings</h3>
                    </div> : null 
                }
                <div style={{marginTop: '2rem'}}>
                    { ERC20Holdings.information === null && emptyERC20Alert ? <Alert type="warning" /> : ( ERC20Holdings.information !== null ? <div style={{marginLeft: '10rem'}}><ERC720HoldingsInfoTable data={ERC20Holdings.information} /></div>  : null ) }
                </div>
                { ERC721Holdings.information !== null || emptyERC721Alert ? 
                    <div style={{marginTop: '2rem'}} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h3 class="h3">ERC721 Holdings</h3>
                    </div> : null 
                }
                <div style={{marginTop: '2rem'}}>
                    { ERC721Holdings.information === null  && emptyERC721Alert ? <Alert type='warning' /> : ( ERC721Holdings.information !== null ? <div style={{marginLeft: '18.5rem'}}><ERC721HoldingsInfoTable data={ERC721Holdings.information} /></div> : null ) }
                </div>
            </main>
        </div>
    )
}

export default WalletStats;