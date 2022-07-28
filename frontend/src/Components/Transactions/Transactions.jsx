import React, { useState, useEffect } from 'react';

const Transactions = () => {
    let result = null;

    useEffect(() => {
        const URL = "https://api.etherscan.io/api";
        const mod="account";
        const action = "balance";
        const address = "<Wallet Address goes here>";
        const tag = "latest";
        const API_KEY = "<API_KEY goes here>";
                
        fetch(URL + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + API_KEY)
        .then(response => response.json())
        .then(res => {
            result = res.result;
        })
        .catch(err => console.log(err));
    }, []);

    // Convert from WEI to ETH 1 ETH = 10^18 WEI
    return (
        <div> 
            <h1>{ result === null ? "Invalid Data" : result*(1/1000000000000000000) }</h1> 
        </div>
    )
}

export default Transactions;