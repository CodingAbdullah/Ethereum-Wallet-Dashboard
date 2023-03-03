import React, { useState } from 'react';
import PriceCoinCard from '../PriceCoinCard/PriceCoinCard';

const PricesPage = () => {
    const [displayToggle, updateDisplayToggle] = useState(false);
    const URL = "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";

    // Display these for each of the cards
    const top15CoinCaps = { Bitcoin: 'BTC',  Ethereum: 'ETH' ,  litecoin: 'LTC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
      algorand: 'ALGO' ,  Cardano: 'ADA' ,  Solana: 'SOL' ,  Polkadot: 'DOT' , Dogecoin: 'DOGE' ,  chainlink: 'LINK' , 
     'matic-network': 'MATIC' ,  'avalanche-2': 'AVAX' , Uniswap: 'UNI' ,  optimism: 'OP' }; 

    const [coinInfo, updateCoinInfo] = useState([]);

    const CoinPriceDisplayHandler = async () => {
        const delay = (ms = 75) => new Promise((r) => setTimeout(r, ms)); // Set timeout for coin price display

        for (var i = 0; i < Object.keys(top15CoinCaps).length; i++){
            await delay();
            await fetch(URL + API_ENDPOINT + "?ids=" + Object.keys(top15CoinCaps)[i] + "&vs_currencies=usd&include_24hr_change=true")
            .then(res => res.json())
            .then(res => {            
                // Fetch from Object.keys() and pick the first key
                console.log(res);
                updateCoinInfo((prevState) => [...prevState, { res }]);        
            })
            .catch(err => {
                console.log(err);
            })
        }
    };

    // Props to be added later after more filtering and testing, the layout is complete for now
    if (!displayToggle){
        return ( 
            <div role="main">
                <button class='btn btn-success' style={{ marginTop: '2rem' }} onClick={() => { updateDisplayToggle(true); CoinPriceDisplayHandler(); }}>Show Coin Prices</button>
            </div>
        )
    }
    else if (displayToggle && coinInfo.length !== 15) {
        return ( 
            <div role="main">
                Loading...
            </div>
        )
    }
    else {
        return (
            <main className="p-3" role="main">
                <h1 style={{ marginTop: '2rem' }}>Prices Chart</h1>
                <p>Here is the list of the latest prices on the top 15 coins by <b>popularity.</b></p>
                <div>
                    <div class="row">
                        {
                           coinInfo.map((coin, key) => {
                                return (
                                    <PriceCoinCard id={key} name={ Object.keys(coin.res)[0] } coinInfo={coin.res} /> // Display child components by passing properties to them
                                );
                            })
                        }
                    </div> 
                </div>
                <button class='btn btn-success' style={{ marginTop: '2rem' }} onClick={() => { updateDisplayToggle(false); updateCoinInfo([]); }}>Hide Coin Prices</button>
            </main>
        )
    }
}

export default PricesPage;