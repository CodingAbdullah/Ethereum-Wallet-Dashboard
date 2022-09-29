import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Alert from '../Alert/Alert';

const Home = () => {

    const [formAlert, updateAlert] = useState("");
    const [walletAddress, updateWalletAddress] = useState("");

    const [btcPrice, updateBtcPrice] = useState({
        information: null
    });

    const [ethPrice, updateEthPrice] = useState({
        information: null
    });

    const [btcColourChange, updateBtcColourChange] = useState("");
    const [ethColourChange, updateEthColourChange] = useState("");
    const [trendingCoins, updateTrendingCoins] = useState("");
    const [globalMarketData, updateGlobalMarketData] = useState({
        information: null
    });

    const navigate = useNavigate();

    const URL = "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // trending coins
    const GLOBALMARKETDATA_ENDPOINT = '/global' // global data
    const QUERY_STRING_BITCOIN = "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

    useEffect(() => {

        // Clear local storage of wallet address
        localStorage.removeItem("walletAddress");

        // Bitcoin Price Action
        fetch(URL + API_ENDPOINT + QUERY_STRING_BITCOIN)
        .then(response => response.json())
        .then(res => {
            if (res.bitcoin !== undefined) {
                updateBtcPrice((prevState) => {
                    return {
                        ...prevState,
                        information: res
                    }
                });

                if (res.bitcoin.usd_24h_change < 0) {
                    updateBtcColourChange("red");
                }
                else {
                    updateBtcColourChange("green");
                }
            }
        })

        // Ethereum Price Action
        fetch(URL + API_ENDPOINT + QUERY_STRING_ETHEREUM)
        .then(response => response.json())
        .then(res => {

            if (res.ethereum !== undefined) {
                updateEthPrice((prevState) => {
                    return {
                        ...prevState,
                        information: res
                    }
                });

                if (res.ethereum.usd_24h_change < 0){
                    updateEthColourChange("red");
                }
                else {
                    updateEthColourChange("green");
                }
            }
        })

        // Get trending information
        fetch(URL + TRENDINGCOINS_ENDPOINT)
        .then(response => response.json())
        .then(res => {
            let finalDisplay = '';
            if (res !== {}) { 
                let information = '';
                for (var i = 0; i < res.coins.length - 2; i++){ // Use 5 instead of the 7 this API fetches
                    information += res.coins[i].item.name;
                    information += ' - ';
                    information += res.coins[i].item.symbol;
                    finalDisplay += information;
                    information = ' | ';
                }
                updateTrendingCoins(finalDisplay);
            }
        })

        fetch(URL + GLOBALMARKETDATA_ENDPOINT) // Fetch global data
        .then(response => response.json())
        .then(res => {
            if (res !== {}){
                updateGlobalMarketData((prevState) => {
                    return {
                        ...prevState,
                        information: res
                    }
                });
            }
        })
    }, []);

    const formHandler = (e) => {
        e.preventDefault();

        if (walletAddress.length === 42 && walletAddress.substring(0, 2) === "0x"){
            localStorage.setItem("walletAddress", walletAddress);
            updateAlert("");
            navigate("/transactions");    
        }
        else {
            if (formAlert === "invalid"){
                e.target.reset();
                localStorage.clear();                
            }
            else {
                updateAlert("invalid");
                localStorage.clear();
            }
        }
    }

    if (btcPrice.information === null || ethPrice.information === null || trendingCoins === '' || globalMarketData.information === null) {
        return <div role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">Loading...</div>
    }
    else {
        // global market data information, destructuring data
        const { active_cryptocurrencies } = globalMarketData.information.data;
        const { usd } = globalMarketData.information.data.total_market_cap;
        const { btc, eth } = globalMarketData.information.data.market_cap_percentage;
        const { market_cap_change_percentage_24h_usd } = globalMarketData.information.data;

        return (
            <div class="home">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Dashboard</h1>
                        </div>
                        { formAlert === "invalid" ? <div><Alert type="danger"/></div> : <div/> }
                        <div class="jumbotron">
                                <div class="container">
                                    <h1 class="display-5" style={{ marginBottom: '2rem' }}>Welcome!</h1>
                                    <p>Your one-stop shop to check the bearings of anything Ethereum! Anything you need to investigate on the blockchain is provided to you ready-made for free. We do the work for you, so you don't have to. Just plug and play!</p> 
                                    <p>Deep dive into collections, wallet information, price action, ENS and much more! Here is a link to all <b>EVM-compatible</b> chains and their respective IDs:
                                        <a style={{ color: 'black', fontStyle: 'italic' }} href="https://chainlist.org" target="_blank" rel="noreferrer"><b> ChainList</b></a>
                                    </p> 
                                    <p>Please note that all activity documented here is on the <b>mainnet</b> network, by default. <b>ERC-1155</b> data not available as of yet. 
                                        <b> Sepolia testnet</b> might not be available on select requests as it is a new testnet. 
                                    </p>
                                    <p>To view information on any <b>testnet</b>, please visit the <b>Wallet/Testnet</b> item on the left sidebar. 
                                       There, you can decide which network to view wallet information from (<b>mainnet</b> by default). The <b> Ropsten</b> testnet is now discontinued.
                                    </p>
                                    <p>Enter the <b>public</b> address below (42-digit hex code) of a wallet to track activity, cheers!</p>
                                    <form style={{ marginTop: '3rem'}} onSubmit={formHandler}>
                                        <input class="form-control mr-sm-2" type="search" placeholder="Enter Wallet Address (0xa2e3se4u5F...)" max="42" min="42" aria-label="Search" onChange={(e) => updateWalletAddress(e.target.value)} required />
                                        <button class="btn btn-outline-success wallet-search-button" type="submit">Search &raquo;</button>
                                    </form>
                                </div>
                        </div>
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Market Data</h1>
                        </div>
                        <div class="container">                   
                            <p style={{ marginBottom: '2rem' }} class='marquee-paragraph'><b>Top 5 Trending Coins: </b>{trendingCoins}</p>
                            <p style={{marginRight: '0.5rem'}}><b>Active Currencies: </b> {active_cryptocurrencies}</p>      
                            <p style={{marginRight: '0.5rem'}}><b>Total Market Cap: </b> ${(usd).toFixed(2)}</p>
                            <p style={{marginRight: '0.5rem'}}><b>Market Dominance: </b> BTC {(btc).toFixed(2) + "%"} <b>|</b> ETH {(eth).toFixed(2) + "%"}</p>
                            <p style={{marginBottom: '4rem', marginRight: '0.5rem'}}><b>24 Hour Market Cap % Change: </b>
                                <p style={{ display: 'inline', color: market_cap_change_percentage_24h_usd < 0 ? 'red' : 'green', fontWeight: 'bold'}}>
                                    {market_cap_change_percentage_24h_usd < 0 ? "" : "+"}{(market_cap_change_percentage_24h_usd).toFixed(2) + "%"}
                                </p>
                            </p>
                            <div class="row">
                                <div class="col-md-6">
                                    <img src={require("../../assets/images/bitcoin.svg").default} width="75" height="75" alt="logo" /><br /> 
                                    <h4>BTC</h4>
                                    <p>Price: <b>${ btcPrice.information.bitcoin.usd.toFixed(2) } USD</b></p> 
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p> 
                                    <b><p style={{ display: 'inline', color: btcColourChange }}>{btcColourChange === "red" ? btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%": "+" + btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%"}</p></b>
                                    <br />
                                    <button class="btn btn-outline-primary wallet-search-button" onClick={() => { navigate("/chart", { state : { coin : 'bitcoin' }}) }}>View Price Action &raquo;</button>
                                </div>
                                <div class="col-md-6">
                                    <img src={require("../../assets/images/ethereum.svg").default} width="75" height="75" alt="logo" /><br />
                                    <h4>ETH</h4>
                                    <p>Price: <b>${ ethPrice.information.ethereum.usd.toFixed(2) } USD</b></p>
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p>
                                    <b><p style={{ display: 'inline', color: ethColourChange }}>{ ethColourChange === "red" ? ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%": "+" + ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%"}</p></b> 
                                    <br />
                                    <button class="btn btn-outline-primary wallet-search-button" onClick={() => { navigate("/chart", { state: { coin: 'ethereum' }}) }}>View Price Action &raquo;</button>
                                </div>
                            </div>
                        </div>
                </main>
            </div>
        )
    }
}

export default Home;