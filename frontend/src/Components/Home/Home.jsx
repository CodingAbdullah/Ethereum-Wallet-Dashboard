import React from 'react';
import './Home.css';
import { useState, useEffect } from 'react';

const Home = () => {

    const [btcPrice, updateBtcPrice] = useState({
        information: null
    });

    const [ethPrice, updateEthPrice] = useState({
        information: null
    });

    const [btcColourChange, updateBtcColourChange] = useState("");
    const [ethColourChange, updateEthColourChange] = useState("");

    const URL= "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";
    const QUERY_STRING_BITCOIN= "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
    const QUERY_STRING_ETHEREUM= "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";


    useEffect(() => {
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
        .catch(err => console.log(err));

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

                if (ethPrice.information.usd_24h_change < 0){
                    updateEthColourChange("red");
                }
                else {
                    updateEthColourChange("green");
                }
            }
        })
        .catch(err => console.log(err)); 
    }, []);

    if (btcPrice.information === null || ethPrice.information === null) {
        return <div>Loading...</div>
    }
    else {
        return (
            <div class="home">
                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Dashboard</h1>
                        </div>
                        <div class="jumbotron">
                                <div class="container">
                                    <h1 class="display-5">Welcome!</h1>
                                    <p>Your one-stop shop to check the bearings of your wallet and coin price action. Enter below the <b>public</b> address (the 42-digit hex code) of your wallet to track your activity!</p>
                                    <form>
                                        <input class="form-control mr-sm-2" type="search" placeholder="Enter Wallet Address (0xa2e3wet5f...)" max="42" min="42" aria-label="Search" required />
                                        <button class="btn btn-outline-success wallet-search-button" type="submit">Search &raquo;</button>
                                    </form>
                                </div>
                        </div>
                        <div class="container">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src={require("../../assets/images/bitcoin-brands.svg").default} width="75" height="75" alt="logo" /><br /> 
                                    <h4>BTC</h4>
                                    <p>Price: ${btcPrice.information.bitcoin.usd} USD</p> 
                                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                                    <p style={{ display: 'inline', color: btcColourChange }}>{btcColourChange === "red" ? "-" + btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%": "+" + btcPrice.information.bitcoin.usd_24h_change.toFixed(2) + "%"}</p>
                                    <br />
                                    <button class="btn btn-outline-primary wallet-search-button" type="submit">View Details &raquo;</button>
                                </div>
                                <div class="col-md-6">
                                    <img src={require("../../assets/images/ethereum-brands.svg").default} width="75" height="75" alt="logo" /><br />
                                    <h4>ETH</h4> 
                                    <p>Price: ${ethPrice.information.ethereum.usd} USD</p>
                                    <p style={{ display: 'inline' }}>24 Hr% Change: </p> 
                                    <p style={{ display: 'inline', color: ethColourChange }}>{ ethColourChange === 'red' ? "-" + ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%": "+" + ethPrice.information.ethereum.usd_24h_change.toFixed(2) + "%"}</p> 
                                    <br />
                                    <button class="btn btn-outline-primary wallet-search-button" type="submit">View Details &raquo;</button>
                                </div>
                            </div>
                        </div>
                </main>
            </div>
        )
    }
}

export default Home;