import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import HomePageDescriptionSection from '../HomePageDescriptionSection/HomePageDescriptionSection';
import Alert from '../Alert/Alert';
import axios from 'axios';

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
        const fetchHomePageInfo = async () => {
            // Clear local storage of wallet address
            localStorage.removeItem("walletAddress");

            // Bitcoin Price Action
            try {
                const response = await axios.get(URL + API_ENDPOINT + QUERY_STRING_BITCOIN);
                if (response.data.bitcoin !== undefined) {
                    updateBtcPrice((prevState) => {
                        return {
                            ...prevState,
                            information: response.data
                        }
                    });

                    if (response.data.bitcoin.usd_24h_change < 0) {
                        updateBtcColourChange("red");
                    }
                    else {
                        updateBtcColourChange("green");
                    }
                }
            }
            catch {

            }

            // Ethereum Price Action
            try {
                const response = await axios.get(URL + API_ENDPOINT + QUERY_STRING_ETHEREUM);
                if (response.data.ethereum !== undefined){
                    updateEthPrice((prevState) => {
                        return {
                            ...prevState,
                            information: response.data
                        }
                    });

                    if (response.data.ethereum.usd_24h_change < 0){
                        updateEthColourChange("red");
                    }
                    else {
                        updateEthColourChange("green");
                    }
                }
            }
            catch {

            }

            // Get trending information
            try {
                const response = await axios.get(URL + TRENDINGCOINS_ENDPOINT);
                let finalDisplay = '';
                if (response !== {}) { 
                    let information = '';
                    for (var i = 0; i < response.data.coins.length - 2; i++){ // Use 5 instead of the 7 this API fetches
                        information += response.data.coins[i].item.name;
                        information += ' - ';
                        information += response.data.coins[i].item.symbol;
                        finalDisplay += information;
                        information = ' | ';
                    }
                    updateTrendingCoins(finalDisplay);
                }
            }
            catch {

            }

            try {
                const response = await axios.get(URL + GLOBALMARKETDATA_ENDPOINT) // Fetch global data
                if (response.data !== {}){
                    updateGlobalMarketData((prevState) => {
                        return {
                            ...prevState,
                            information: response.data
                        }
                    });
                }
            }
            catch {

            }
        };
        fetchHomePageInfo();   
    }, []);

    // Pass function to child component
    const updateAddress = (e) => {
        updateWalletAddress(e.target.value);
    }

    // Pass address to local storage for API call
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
                        <HomePageDescriptionSection form={formHandler} updatingAddress={updateAddress} />
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Market Data</h1>
                        </div>
                        <div class="container">                   
                            <p style={{ marginBottom: '2rem' }} class='marquee-paragraph'><b>Top 5 Trending Coins: </b>{ trendingCoins }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Active Currencies: </b> { active_cryptocurrencies }</p>      
                            <p style={{ marginRight: '0.5rem' }}><b>Total Market Cap: </b> ${ (usd).toFixed(2) }</p>
                            <p style={{ marginRight: '0.5rem' }}><b>Market Dominance: </b> BTC { (btc).toFixed(2) + "%" } <b>|</b> ETH { (eth).toFixed(2) + "%" }</p>
                            <p style={{ marginBottom: '4rem', marginRight: '0.5rem' }}><b>24 Hour Market Cap % Change: </b>
                                <p style={{ display: 'inline', color: market_cap_change_percentage_24h_usd < 0 ? 'red' : 'green', fontWeight: 'bold'} }>
                                    { market_cap_change_percentage_24h_usd < 0 ? "" : "+" }{ (market_cap_change_percentage_24h_usd).toFixed(2) + "%" }
                                </p>
                            </p>
                            <div class="row">
                                <div class="col-md-6">
                                    <img src={require("../../assets/images/bitcoin.svg").default} width="75" height="75" alt="logo" /><br /> 
                                    <h4>BTC</h4>
                                    <p>Price: <b>${ btcPrice.information.bitcoin.usd.toFixed(2) } USD</b></p> 
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p> 
                                    <b><p style={{ display: 'inline', color: btcColourChange }}>{btcColourChange === "red" ? btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%": "+" + btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%" }</p></b>
                                    <br />
                                    <button class="btn btn-outline-primary wallet-search-button" onClick={() => { navigate("/chart", { state : { coin : 'bitcoin' }}) }}>View Price Action &raquo;</button>
                                </div>
                                <div class="col-md-6">
                                    <img src={ require("../../assets/images/ethereum.svg").default } width="75" height="75" alt="logo" /><br />
                                    <h4>ETH</h4>
                                    <p>Price: <b>${ ethPrice.information.ethereum.usd.toFixed(2) } USD</b></p>
                                    <p style={{ display: 'inline' }}>24 Hour % Change: </p>
                                    <b><p style={{ display: 'inline', color: ethColourChange }}>{ ethColourChange === "red" ? ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%": "+" + ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%" }</p></b> 
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