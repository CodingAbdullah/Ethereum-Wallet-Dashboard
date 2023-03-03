import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';
import TransactionsInfoTable from '../TransactionsInfoTable/TransactionsInfoTable';
import InternalTransactionsInfoTable from '../InternalTransactionsInfoTable/InternalTransactionsInfoTable';
import axios from 'axios';

const Transactions = () => {
    const [amount, updateAmount] = useState(0.00);
    const [emptyAlert, updateEmptyAlert] = useState(false);
    const [emptyInteralTransactionAlert, updateEmptyInternalTransactionAlert] = useState(false);
    const [address, updateAddress] = useState("");

    const [ethPrice, updateETHPrice] = useState({ 
        information: null // ETH Price Tracker
    }); 
    
    const [transactions, updateTransactions] = useState({ 
        information: null // Transactions
    }); 

    const [internalTransactions, updateInternalTransactions] = useState({
        information: null // Internal Transactions of a wallet
    });
    
    // Endpoints to be used
    const NODE_SERVER_URL = "http://localhost:5000";
    const TRANSACTION_BALANCE_ENDPOINT = '/address-transaction-amount';
    const TRANSACTION_HISTORY_ENDPOINT = '/address-transaction-history';
    const INTERNAL_TRANSACTION_HISTORY_ENDPOINT = '/address-internal-transaction-history';

    const ETHPRICE_URL = "https://api.coingecko.com/api/v3";
    const PRICE_ENDPOINT = "/simple/price";
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

    const navigate = useNavigate();

    useEffect(() => {
        const addr = localStorage.getItem('walletAddress');
        updateAddress(addr);

        // Redirect if invalid wallet is asked to be entered again as it is removed from system
        if ((addr === null) || (addr.length !== 42) || (addr.substring(0, 2) !== '0x')){
            navigate('/');
        }

        const options = {
            method: 'POST',
            body: JSON.stringify({ address : addr }),
            headers: {
                'content-type': 'application/json'
            }
        };
    
        // ETH balance of a particular account, run checks to see validity
        axios.post(NODE_SERVER_URL + TRANSACTION_BALANCE_ENDPOINT, options)
        .then(response => {
            // Display messages according to order of response
            if (response.data.information.message === 'OK' && response.status === 200){
                updateAmount(response.data.information.result);
                updateEmptyAlert(false);

                // Transactions of a particular account, IF the address of the particular one entered is valid
                axios.post(NODE_SERVER_URL + TRANSACTION_HISTORY_ENDPOINT, options)
                .then(response => {
                    if (response.status !== 200){
                        updateEmptyAlert(true);
                        updateEmptyInternalTransactionAlert(true);
                        localStorage.clear();                
                    }
                    else if (response.data.information.message === 'OK' && response.status === 200){
                        updateTransactions((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                        updateEmptyAlert(false);
                    }
                    else if (response.data.information.message === 'No transactions found' && response.status === 200){
                        updateEmptyAlert(true);
                        updateEmptyInternalTransactionAlert(true);
                        localStorage.clear();                
                    }
                })
                .catch(() => {
                    updateEmptyAlert(true); // Message was not ok, therefore ask to redirect
                    updateEmptyInternalTransactionAlert(true);
                    localStorage.clear();                
                });

                // Wallet Interal Transaction History
                axios.post(NODE_SERVER_URL + INTERNAL_TRANSACTION_HISTORY_ENDPOINT, options)
                .then(response => {
                    if (response.status !== 200){
                        updateEmptyInternalTransactionAlert(true);
                        localStorage.clear();                
                    }
                    else if (response.data.information.message === 'OK' && response.status === 200){
                        updateInternalTransactions((prevState) => {
                            return {
                                ...prevState,
                                information: response.data.information
                            }
                        });
                        updateEmptyInternalTransactionAlert(false);
                    }
                    else if (response.data.information.message === 'No transactions found' && response.status === 200){
                        updateEmptyInternalTransactionAlert(true);
                    }
                })
                .catch(() => {
                    updateEmptyInternalTransactionAlert(true); // Message was not ok, therefore ask to redirect
                    localStorage.clear();                
                });
            }
            else {
                updateEmptyAlert(true);
                updateEmptyInternalTransactionAlert(true);
                localStorage.clear();                
            }
        })
        .catch(() => {
            updateEmptyAlert(true);
            updateEmptyInternalTransactionAlert(true);
            localStorage.clear();                
        });

        // ETH Price
        axios.get(ETHPRICE_URL + PRICE_ENDPOINT + QUERY_STRING_ETHEREUM)
        .then(res => {
            if (res.data.ethereum !== undefined) {
                updateETHPrice((prevState) => {
                    return {
                        ...prevState,
                        information: res.data
                    }
                });
            }
        });
    }, []);
    
    // Conditionally render page based on alerts when wallet is either empty or invalid
    if ( emptyAlert ) {
        return (
            <main role="main" class="col-md-9 p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Transactions</h1>
                </div>
                <Alert type='warning' />
                <button className='btn btn-success' onClick={() => navigate("/")} style={{ marginTop: '3rem' }}>Go Home</button>
            </main>
        )
    }
    else if ( address === '' || ethPrice === {} || transactions.information === null || transactions.information === null) {
        return <div role="main" class="col-md-9 p-3">Loading...</div>
    }
    else {
        return ( 
            <>
                <main role="main" class="col-md-9 p-3">
                    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 class="h2">Transactions</h1>
                    </div>
                    <h3 style={{ marginTop: '1.5rem' }}>{ "Account: " + address }</h3>
                    <h5>{ "ETH Balance: " + (amount*(1/1000000000000000000)) + " ETH (@ $" + ethPrice.information.ethereum.usd.toFixed(2) + " USD/ETH)" }</h5>
                    <h6>{ "Amount in USD: $" + ((amount*(1/1000000000000000000))*(ethPrice.information.ethereum.usd)).toFixed(2) + " USD" }</h6>
                </main>            
                <main class="col-md-9 p-3" role="main">
                        <div>
                            {
                                transactions.information === null ? null :
                                    <>
                                        <main style={{ marginTop: '5rem' }} role="main">
                                            <div style={{ marginTop: '1rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                                <h3 class="h3">Latest 1000 Transactions or Maximum/Wallet</h3>
                                            </div>
                                        </main>
                                        <TransactionsInfoTable walletAddress={ address } networkFetch={false} data={ transactions.information.result } />                                
                                    </>
                            }
                        </div>
                </main>
                <main style={{ marginTop: '1rem' }} class="col-md-9 p-3" role="main">
                        <div>
                            {
                                emptyInteralTransactionAlert ? <Alert type='warning-empty-internal' /> :
                                (
                                    internalTransactions.information === null ? null :
                                        <>
                                            <main style={{ marginTop: '5rem' }} role="main">
                                                <div style={{ marginTop: '1rem' }} class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                                                    <h3 class="h3">Internal Transactions</h3>
                                                </div>
                                            </main>
                                            <InternalTransactionsInfoTable walletAddress={ address } data={ internalTransactions.information.result } /> 
                                        </>
                                )
                            }
                        </div>
                </main>
                <main role="main" class="p-3">
                    <button style={{ marginTop: '1.5rem' }} class="btn btn-success" onClick={() => { navigate("/"); localStorage.removeItem('walletAddress'); }}>Go Back</button>
                </main>
            </>
        )
    }
}

export default Transactions;