import axios from 'axios';

// Fetch data related to the current trending coins in the market
export const homePageTrendingCoinsPro = async () => {
    const URL = "http://localhost:5000";
    const TRENDINGCOINS_ENDPOINT = '/trending-coin-data'; // Trending coins in the market

    // Set options for API request
    let options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json'
        }
    }

    // Make API request for data
    let response = await axios.get(URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins

    // If error is returned, throw error
    // If not, return trending coin data
    if (response.status !== 200) {
        throw new Error("Could not fetch data related to trending coins");
    }
    else {
        return response.data.trendingCoinData;
    }
}