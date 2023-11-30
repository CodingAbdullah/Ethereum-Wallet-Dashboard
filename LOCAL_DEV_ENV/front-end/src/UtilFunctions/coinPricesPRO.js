import axios from 'axios';

export const coinPricesPro = async () => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/coin-prices';

    // const URL = "https://api.coingecko.com/api/v3";
    // const API_ENDPOINT = "/simple/price";

    //  Display these for each of the cards
    //  const top15CoinCaps = { Bitcoin: 'BTC',  Ethereum: 'ETH' ,  litecoin: 'LTC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
    //  algorand: 'ALGO' ,  Cardano: 'ADA' ,  Solana: 'SOL' , Dogecoin: 'DOGE' , 
    // 'matic-network': 'MATIC' }; 

    // Fetch data related to each of the coins and push to coin price tracker array
    // for (let i = 0; i < Object.keys(top15CoinCaps).length; i++) {
    // setTimeout(() => console.log("Delaying..."), i*2000);
    
    let response = await axios.get(URL + API_ENDPOINT); // +  "?ids=" + Object.keys(top15CoinCaps)[i] + "&vs_currencies=usd&include_24hr_change=true");

    if (response.status === 200) {
        return response.data.coinData;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   