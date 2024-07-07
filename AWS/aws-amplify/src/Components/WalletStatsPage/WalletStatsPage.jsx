import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Alert from '../Alert/Alert';
import InternalTransactionsInfoTable from '../InternalTransactionsInfoTable/InternalTransactionsInfoTable';
import TransactionsInfoTable from '../TransactionsInfoTable/TransactionsInfoTable';
import ERC720HoldingsInfoTable from '../ERC720HoldingsInfoTable/ERC720HoldingsInfoTable';
import ERC721HoldingsInfoTable from '../ERC721HoldingsInfoTable/ERC721HoldingsInfoTable';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import TransactionBalanceInfoTable from '../TransactionBalanceInfoTable/TransactionBalanceInfoTable';

const WalletStats = () => {
    const [setAlert, updateAlert] = useState(false);
    const [networkID, updateNetworkID] = useState('eth');
    const [checkComplete, updateCheckComplete] = useState(false);

    // Hooks for setting wallet address, transactions, internal transactions, token holdings, and wallet net worth
    const [walletAddress, updateWalletAddress] = useState("");

    const [transactions, updateTransactions] = useState({
        information: null
    });

    const [internalTransactions, updateInternalTransactions] = useState({
        information: null
    });

    const [ERC20Holdings, updateERC20Holdings] = useState({
        information: null
    });

    const [ERC721Holdings, updateERC721Holdings] = useState({
        information: null
    });

    const [walletNetWorth, updateWalletNetWorth] = useState({
        information: null 
    });

    const navigate = useNavigate(); // Navigation hook

    // Endpoints and URLs
    const NODE_SERVER_URL = "http://localhost:5000";
    const TRANSACTION_DETAIL_ENDPOINT = "/address-transaction-details";
    const INTERNAL_TRANSACTION_DETAIL_ENDPOINT = "/address-internal-transaction-history";
    const ADDRESS_ERC20HOLDINGS_ENDPOINT = '/address-erc20-holdings';
    const ADDRESS_ERC721HOLDINGS_ENDPOINT = "/address-erc721-holdings";
    const ADDRESS_DETAILS_ENDPOINT = "/address-details";
    const WALLET_NET_WORTH_ENDPOINT = '/address-net-worth';

    // Clear data upon error
    const alertHandler = () => {
        updateAlert(true);
        updateTransactions((prevState) => ({
            ...prevState,
            information: null
        }));
        updateInternalTransactions((prevState) => ({
            ...prevState,
            information: null
        }));
        updateERC20Holdings((prevState) => ({
            ...prevState,
            information: null
        }));
        updateERC721Holdings((prevState) => ({
            ...prevState,
            information: null
        }));
        updateWalletNetWorth((prevState) => ({
            ...prevState,
            information: null
        }));
    };

    const clearHandler = () => {
        // Clear out errors and alerts
        updateAlert(false);
        updateTransactions((prevState) => ({
            ...prevState,
            information: null
        }));
        updateInternalTransactions((prevState) => ({
            ...prevState,
            information: null
        }));
        updateERC20Holdings((prevState) => ({
            ...prevState,
            information: null
        }));
        updateERC721Holdings((prevState) => ({
            ...prevState,
            information: null
        }));
        updateWalletNetWorth((prevState) => ({
            ...prevState,
            information: null
        }));
    };

    const updateNetworkHandler = (e) => {
        updateNetworkID(e.target.value);
    };

    const formHandler = (e) => {
        e.preventDefault();

        // Set options for fetch and flight responses
        const options = {
            method: 'POST',
            body: JSON.stringify({ address: walletAddress, network: networkID }),
            headers: {
                'content-type': 'application/json'
            }
        };

        // Gather wallet analytics using API resources and running checks to see if wallet address is valid
        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === '0x') {
            // Wallet net worth endpoint for retrieving wallet net worth
            axios.post(NODE_SERVER_URL + WALLET_NET_WORTH_ENDPOINT, options)
                .then(response => {
                    updateAlert(false); // Remove alerts if any exist
                    updateWalletNetWorth((prevState) => ({
                        ...prevState,
                        information: response.data.walletNetWorth
                    }));
                })
                .catch(() => {
                    alertHandler();
                });

            axios.post(NODE_SERVER_URL + ADDRESS_DETAILS_ENDPOINT, options)
                .then(res => {
                    if (res.data.information.message === 'OK') {
                        updateAlert(false);
                    } 
                    else {
                        // Valid length entered, but invalid address means invalid address, update alert, remove, data, remove other alerts
                        alertHandler();
                    }
                })
                .catch(() => {
                    alertHandler();
                });

            // Transactions of a particular account, if the address of the particular one entered is valid
            axios.post(NODE_SERVER_URL + TRANSACTION_DETAIL_ENDPOINT, options)
                .then(res => {
                    if (res.data.information.result.length !== 0) {
                        updateAlert(false); // Remove alerts if any exist
                        updateTransactions((prevState) => ({
                            ...prevState,
                            information: res.data.information
                        }));
                    }
                })
                .catch(() => {
                    alertHandler();
                });

            // Internal transactions of a particular account, if the address of the particular one entered is valid
            axios.post(NODE_SERVER_URL + INTERNAL_TRANSACTION_DETAIL_ENDPOINT, options)
                .then(res => {
                    if (res.data.information.result.length !== 0) {
                        updateAlert(false); // Remove alerts if any exist
                        updateInternalTransactions((prevState) => ({
                            ...prevState,
                            information: res.data.information
                        }));
                    }
                })
                .catch(() => {
                    alertHandler();
                });

            // ERC20 endpoint for retrieving information related to holdings
            axios.post(NODE_SERVER_URL + ADDRESS_ERC20HOLDINGS_ENDPOINT, options)
                .then(response => {
                    if (response.status === 200 && response.data.information.length === 0) { // If empty, display warning
                        updateAlert(false); // Remove alerts if any exist
                        updateERC20Holdings((prevState) => ({
                            ...prevState,
                            information: null
                        }));
                    } 
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateERC20Holdings((prevState) => ({
                            ...prevState,
                            information: response.data.information
                        }));
                    }
                })
                .catch(() => {
                    alertHandler();
                });

            // ERC721 endpoint for retrieving information related to holdings
            axios.post(NODE_SERVER_URL + ADDRESS_ERC721HOLDINGS_ENDPOINT, options)
                .then(response => {
                    if (response.status === 200 && response.data.information.result.length === 0) { // If empty, display warning
                        updateAlert(false); // Remove alerts if any exist
                        updateERC721Holdings((prevState) => ({
                            ...prevState,
                            information: null
                        }));
                    } 
                    else {
                        updateAlert(false); // Remove alerts if any exist
                        updateERC721Holdings((prevState) => ({
                            ...prevState,
                            information: response.data.information
                        }));
                    }
                })
                .catch(() => {
                    alertHandler();
                });

            updateCheckComplete(true);
        } 
        else {
            // Invalid address means invalid alert display, remove other alerts, clear data
            alertHandler();
            updateCheckComplete(true);
        }
    };

    return (
        <div className="wallet-stats">
            <main role="main" className="p-3">
                <div>                    
                    <h1>Wallet Analytics</h1>
                    <hr />
                </div>
                {setAlert ? <Alert type='danger' /> : null}
                <div className="jumbotron">
                    <div className="container">
                        <p className="lead text-muted"><i>Enter <b>wallet address</b> for a quick analysis</i></p>
                        <form onSubmit={formHandler}>
                            <input className="form-control" style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '50%' }}
                                placeholder="Enter Wallet Address" onChange={(e) => updateWalletAddress(e.target.value)} required />
                            <NetworkSelector updateNetworkHandler={updateNetworkHandler} />
                            <button style={{ marginTop: '2rem' }} className="btn btn-success">Submit</button>
                        </form>
                        <button style={{ marginTop: '2rem', display: 'inline' }} class='btn btn-primary' onClick={ () => navigate("/") }>Go Home</button>
                        <button style={{ marginTop: '2rem', marginLeft: '2rem' }} class='btn btn-warning' onClick={clearHandler}>Clear</button>
                    </div>
                </div>
                { checkComplete && walletNetWorth.information !== null ? (
                    <TransactionBalanceInfoTable data={ walletNetWorth.information } />
                ) : null }
                { checkComplete && transactions.information !== null ? (
                    <>
                        <hr style={{ marginTop: '3rem' }} />
                        <TransactionsInfoTable walletAddress={ walletAddress } networkFetch={ transactions.information.isMoralis } data={ transactions.information.result } />
                    </>
                ) : null }
                { checkComplete && internalTransactions.information !== null ? (
                    <>
                        <hr style={{ marginTop: '3rem' }} />
                        <InternalTransactionsInfoTable walletAddress={ walletAddress } data={ internalTransactions.information.result } />
                    </>
                ) : null }
                { checkComplete && ERC20Holdings.information !== null ? (
                    <ERC720HoldingsInfoTable data={ ERC20Holdings.information } />
                ) : null }
                { checkComplete && ERC721Holdings.information !== null ? (
                    <ERC721HoldingsInfoTable data={ ERC721Holdings.information } />
                ) : null }
            </main>
        </div>
    );
}

export default WalletStats;