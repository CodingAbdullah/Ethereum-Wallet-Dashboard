import React, { useState } from 'react';
import { useEffect } from 'react';
import PriceCoinCard from '../PriceCoinCard/PriceCoinCard';

const PricesPage = () => {
    // Display these for each of the cards
    const top15CoinCaps = { Bitcoin: 'BTC',  Ethereum: 'ETH' ,  litecoin: 'LTC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
      algorand: 'ALGO' ,  Cardano: 'ADA' ,  Solana: 'SOL' ,  Polkadot: 'DOT' , Dogecoin: 'DOGE' ,  chainlink: 'LINK' , 
     'matic-network': 'MATIC' ,  'avalanche-2': 'AVAX' , Uniswap: 'UNI' ,  optimism: 'OP' }; 

    const [coinInfo, updateCoinInfo] = useState([]);

    useEffect(() => {
        const URL = "https://api.coingecko.com/api/v3";
        const API_ENDPOINT = "/simple/price";

        const fetchCoinData = async () => {
            // Pick the coins by the list outlined above.. top 15 coins by market cap
            for (var i = 0; i < Object.keys(top15CoinCaps).length; i++){
                await fetch(URL + API_ENDPOINT + "?ids=" + Object.keys(top15CoinCaps)[i] + "&vs_currencies=usd&include_24hr_change=true")
                .then(response => response.json())
                .then(res => {            
                    // Fetch from Object.keys() and pick the first key
                    updateCoinInfo((prevState) => [...prevState, { res }]);        
                })
                .catch(err => {
                    console.log(err);
                })
            }
        }
        fetchCoinData();
    }, []);

    // Props to be added later after more filtering and testing, the layout is complete for now
    if (coinInfo.length !== 30){
        return <div role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">Loading...</div>
    }
    else {
        let cards = [];
        for (var i = 0; i < coinInfo.length; i += 2){
            cards.push(coinInfo[i]); // Remove duplicatess
        }
        return (
            <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                <h1 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Prices Chart</h1>
                <p>Here is the list of the latest prices on the top 15 coins by <b>popularity.</b></p>
                <div style={{ marginLeft: '2rem' }} class="container col-md-9 ml-sm-auto col-lg-10 px-md-4">
                    <div style={{marginLeft: '1.5rem'}} class="row">
                        {
                           cards.map((coin, key) => {
                                return (
                                    <PriceCoinCard id={key} name={ Object.keys(coin.res)[0] } coinInfo={coin.res} /> // Display child components by passing properties to them
                                );
                            })
                        }
                    </div> 
                </div>
            </main>
        )
    }
}

export default PricesPage;