import React, { useState } from 'react';
import { useEffect } from 'react';
import PriceCoinCard from '../PriceCoinCard/PriceCoinCard';

const PricesPage = () => {
    const top15CoinCaps = [{ Bitcoin: 'BTC' }, { Ethereum: 'ETH' }, { USD: 'USDC' }, { Binance: 'BNB' }, { Ripple: 'XRP' }, 
    { BinanceUSD: 'BUSD' }, { Cardano: 'ADA' }, { Solana: 'SOL' }, { Polkadot: 'DOT' }, { Dogecoin: 'DOGE' }, { DAI: 'DAI' }, 
    { Polygon: 'MATIC' }, { Avalanche: 'AVAX' }, { Uniswap: 'UNI' }, { Shib: 'SHIB' }] // Display these for each of the cards.

    const [coinPriceInfo, updateCoinInfo] = useState([]);

    useEffect(() => {
        const URL = "https://api.coingecko.com/api/v3";
        const API_ENDPOINT = "/simple/price";

        // Pick the coins by the list outlined above.. top 15 coins by market cap
        for (var i = 0; i < top15CoinCaps.length; i++){
            fetch(URL + API_ENDPOINT + "?ids=" + Object.keys(top15CoinCaps[i])[0] + "&vs_currencies=usd&include_24hr_change=true") // fetch from Object.keys() and pick the first key
            .then(response => response.json())
            .then(res => {
                console.log(res); 
            })
            .catch(err => {
                console.log(err);
            })
        }
    }, []);

    // Props to be added later after more filtering and testing, the layout is complete for now
    return (
        <div class="container">
            <div class="row">
                <div class="col">
                    <PriceCoinCard /> 
                </div>
            </div>
        </div>
    )
}

export default PricesPage;