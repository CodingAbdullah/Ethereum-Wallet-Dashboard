import React, { useState, useEffect } from 'react';
import '../Sidebar/Sidebar.css';
import axios from 'axios';

const Sidebar = () => {
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const COINGECKO_URL = "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";

    const [price, updatePrice] = useState({
        information: null
    });

    const [status, updateStatus] = useState(false);

    const clearHandler = () => { // Clear handler function to remove data
        updatePrice((prevState => {
            return {
                ...prevState,
                information: null
            }
        }));
        updateStatus(false);
    }

    useEffect(() => {
        axios.get(COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM) // Retrieve price information right after render
        .then(response => {
            if (response.status === 200){
                updatePrice((prevState) => {
                    return {
                        ...prevState,
                        information: response.data.ethereum
                    }
                });
                updateStatus(true);
            }
            else {
                clearHandler();
            }
        })
        .catch(err => {
            clearHandler();
        }) 
        }, [])

    return (
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
            <div style={{ color: 'white', marginTop: '1rem'}}>ETH Price: { price.information == null ? "Loading" : "$" + price.information.usd.toFixed(2) }</div>
            { price.information === null ? null : 
                (  
                    <>
                        <p style={{ display: 'inline', color: 'white' }}>24-Hr % Chg:</p>
                        <p style={{ color: price.information.usd_24h_change < 0 ? 'red' : 'lightgreen', marginTop: '1rem', display: 'inline' }}>
                            <b>{ price.information.usd_24h_change > 0 ? " +" + price.information.usd_24h_change.toFixed(2) + "%" : price.information.usd_24h_change.toFixed(2) + "%" }</b>
                        </p> 
                    </>
                ) 
            }
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" />
            <div class="sidebar-sticky pt-3">
                <table class="table table-striped table-dark">
                    <tbody>
                        <tr class="col-sm-3">
                            <td><img src={require("../../assets/images/dashboard.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/">Dashboard</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/analytics.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/walletAnalytics">Wallet Analytics</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/collections.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/collections">Collections</a></td>
                         </tr>
                        <tr>
                            <td><img src={require("../../assets/images/charts.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/prices">Coin Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc20-token-prices">ERC20 Token Prices</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc20Token.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc20-holdings">ERC20 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/nft.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc721-lookups">ERC721 Token Lookups</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/erc721Holdings.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/erc721-holdings">ERC721 Token Holdings</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/ensTwo.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/ens-lookup">ENS Lookups</a></td>
                        </tr>
                        <tr>
                            <td><img src={require("../../assets/images/about.png")} width="35" height="30" alt="logo" /></td>
                            <td><a style={{color: 'white'}} href="/about">About</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </nav>
    );
}

export default Sidebar;