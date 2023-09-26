import axios from 'axios';

export const coinPrices = async () => {
    const URL = "https://api.coingecko.com/api/v3";
    const API_ENDPOINT = "/simple/price";

    let coinPrices = [];

    // Display these for each of the cards
    const top15CoinCaps = { Bitcoin: 'BTC',  Ethereum: 'ETH' ,  litecoin: 'LTC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
      algorand: 'ALGO' ,  Cardano: 'ADA' ,  Solana: 'SOL' , Dogecoin: 'DOGE' , 
     'matic-network': 'MATIC' }; 

     // Fetch data related to each of the coins and push to coin price tracker array
     for (let i = 0; i < Object.keys(top15CoinCaps).length; i++) {
        setTimeout(() => console.log("Delaying..."), i*2000);
        let response = await axios(URL + API_ENDPOINT +  "?ids=" + Object.keys(top15CoinCaps)[i] + "&vs_currencies=usd&include_24hr_change=true");

        if (response.status !== 200) {
            break;
        }
        else {
            coinPrices.push(response.data);
        }
     }

     return coinPrices;
}   