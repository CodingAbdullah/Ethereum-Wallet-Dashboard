import axios from 'axios';

// Fetch data related to the current trending coins in the market
export const homePageTrendingCoins = async () => {
    const URL = "https://api.coingecko.com/api/v3";
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // Trending coins in the market
    let trendingCoinData = "";

    let response = await axios.get(URL + TRENDINGCOINS_ENDPOINT); // Fetch data related to trending coins

    if (response.status !== 200) {
        throw new Error("Could not fetch data related to trending coins");
    }
    else {
        // Format display data
        let information = '';
        for (var i = 0; i < response.data.coins.length - 2; i++){ 
            information += response.data.coins[i].item.name;
            information += ' - ';
            information += response.data.coins[i].item.symbol;
            trendingCoinData += information;
            information = ' | ';
        }
    }

    return trendingCoinData;
}