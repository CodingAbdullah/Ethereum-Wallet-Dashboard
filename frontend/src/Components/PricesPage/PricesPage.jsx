import React, { useState } from 'react';
import { useEffect } from 'react';
import PriceCoinCard from '../PriceCoinCard/PriceCoinCard';

const PricesPage = () => {
    // Display these for each of the cards
    const top15CoinCaps = { Bitcoin: 'BTC',  Ethereum: 'ETH' ,  USD: 'USDC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
     'binance-usd': 'BUSD' ,  Cardano: 'ADA' ,  Solana: 'SOL' ,  Polkadot: 'DOT' , Dogecoin: 'DOGE' ,  dai: 'DAI' , 
     'matic-network': 'MATIC' ,  'avalanche-2': 'AVAX' , Uniswap: 'UNI' ,  'shiba-inu': 'SHIB' }; 

    const coinKeys = Object.keys(top15CoinCaps);
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
        return <div>Loading...</div>
    }
    else {
        console.log(coinInfo)
        return (
            <div class="container">
                <div class="row">
                    { coinInfo.map(coin => {
                        return (
                            <PriceCoinCard name={Object.keys(coin.res)[0]} coinInfo={coin.res} /> // Will fix duplicates later and formatting..
                        );
                    })}
                </div> 
            </div>
        )
    }
}

export default PricesPage;