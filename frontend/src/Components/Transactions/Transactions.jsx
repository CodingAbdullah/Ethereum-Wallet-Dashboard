import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';

const Transactions = () => {
    const [amount, updateAmount] = useState(0.00);
    const [validAddress, updateValidity] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const URL = "https://api.etherscan.io/api";
        const mod="account";
        const action = "balance";
        const address = localStorage.getItem('walletAddress');
        const tag = "latest";
        const API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
                
        fetch(URL + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + API_KEY)
        .then(response => response.json())
        .then(res => {
            if (res.message === 'OK'){
                updateAmount(res.result);
                localStorage.removeItem('walletAddress'); // Remove the key:value pair.
                updateValidity(true);
            }
            else {
                updateValidity(false); // message was not ok, therefore ask to redirect
            }
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

    if (validAddress === null) {
        return <div>Loading...</div>
    }
    else if (validAddress === false){
        return (
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <Alert type="danger" />
                <button class="btn btn-success" onClick={() => { navigate("/"); localStorage.removeItem('walletAddress'); }}>Go Home</button>
            </main>
        )
    }
    else {
        return (
            <h1>{ amount*(1/1000000000000000000) + " ETH"}</h1> // Will obviously add more later here...
        )
    }
}

export default Transactions;