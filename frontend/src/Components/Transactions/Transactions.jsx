import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Alert from '../Alert/Alert';

const Transactions = () => {
    const [amount, updateAmount] = useState(0.00);
    const [validAddress, updateValidity] = useState(null);
    const [address, updateAddress] = useState("");
    const [ethPrice, updateETHPrice] = useState({});
    
    const navigate = useNavigate();

    useEffect(() => {
        const URL = "https://api.etherscan.io/api";
        const mod="account";
        const action = "balance";
        const addr = localStorage.getItem('walletAddress');
        const tag = "latest";
        const API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
        updateAddress(addr);
    
        fetch(URL + "?module=" + mod + "&action=" + action + "&address=" + addr + "&tag=" + tag + "&apikey=" + API_KEY)
        .then(response => response.json())
        .then(res => {
            if (res.message === 'OK'){
                updateAmount(res.result);
                localStorage.clear();                
                updateValidity(true);
            }
            else {
                updateValidity(false); // Message was not ok, therefore ask to redirect
                localStorage.clear();                
            }
        })
        .catch(err => {
            console.log(err);
        });

        // ETH Transactions of a particular wallet
        const ETHPRICE_URL = "https://api.coingecko.com/api/v3";
        const API_ENDPOINT = "/simple/price";
        const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

        fetch(ETHPRICE_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM)
        .then(response => response.json())
        .then(res => {
            if (res.ethereum !== undefined) {
                updateETHPrice((prevState) => {
                    return {
                        ...prevState,
                        information: res
                    }
                });
            }
        })
        .catch(err => console.log(err));
    }, []);

    if (validAddress === null || address === '' || ethPrice === {}) {
        return <div>Loading...</div>
    }
    else if (validAddress === false || address === ''){
        return (
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <Alert type="danger" />
                <button class="btn btn-success" onClick={() => { navigate("/"); localStorage.clear(); }}>Go Home</button>
            </main>
        )
    }
    else {
        return ( 
            // Adding items here for now, later, all will be styled
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <h3>{ "Account: " + address}</h3>
                <h5>{"Amount: " + (amount*(1/1000000000000000000) + " ETH (@ $" + ethPrice.information.ethereum.usd.toFixed(2) + " USD/ETH)")}</h5>
            </main>
        )
    }
}

export default Transactions;