import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SidebarMetricsSection = () => {
    const COINGECKO_URL = "https://api.coingecko.com/api/v3";
    const BLOCKNATIVE_URL = 'https://api.blocknative.com/gasprices/blockprices';

    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    const [price, updatePrice] = useState({
        information: null
    });

    const [gasInfo, updateGasInfo] = useState({
        information: null
    });

    const clearHandler = () => { // Clear handler function to remove data
        updatePrice((prevState => {
            return {
                ...prevState,
                information: null
            }
        }));

        updateGasInfo((prevState) => { // Clear data when error found with API request
            return {
                ...prevState,
                information: null
            }
        });
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
            }
            else {
                clearHandler();
            }
        })
        .catch(() => {
            clearHandler();
        });

        const options = {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'content-type' : 'application/json', 
                'accept': 'application/json',
                'Authorization' : process.env.REACT_APP_BLK_API_KEY // BlockNative API key hidden 
            }
        };

        axios.get(BLOCKNATIVE_URL, options) 
        .then(res => {
            if (res.status === 200){
                updateGasInfo((prevState) => { // If successful, update information
                    return {
                        ...prevState,
                        information: res.data
                    }
                });
            }
            else {
                clearHandler();
            }
        })
        .catch(() => {
            clearHandler();
        });
        }, [])

    return (
        <>
            <div style={{ color: 'white', marginTop: '1rem'}}>ETH Price: <b>{ price.information == null ? "Loading" : "$" + price.information.usd.toFixed(2) }</b></div>
            { price.information === null ? null : 
                (  
                    <>
                        <p style={{ display: 'inline', color: 'white' }}>24-Hr % Chg:</p>
                        <p style={{ color: price.information.usd_24h_change < 0 ? 'red' : 'lightgreen', marginTop: '1rem', display: 'inline' }}>
                            <b>{ price.information.usd_24h_change > 0 ? " +" + price.information.usd_24h_change.toFixed(2) + "%" : " " + price.information.usd_24h_change.toFixed(2) + "%" }</b>
                        </p> 
                    </>
                ) 
            }
            <br />
            { gasInfo.information === null ? null :
                (
                    <>
                        <p style={{ display: 'inline', color: 'white' }}>Gas Price:</p>
                        <p style={{ display: 'inline', color: 'white' }}><b>{ " " + gasInfo.information.maxPrice + " " }</b>Gwei</p>
                    </>
                )
            }
        </>
    )
}

export default SidebarMetricsSection;