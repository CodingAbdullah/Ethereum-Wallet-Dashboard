import axios from 'axios';

export const metricsNavbarEthPricePro = async () => {
    const COINGECKO_URL = "http://localhost:5000";
    const API_ENDPOINT = "/navbar-ethereum-price";

    // Setting options for API request
    let options = {
        method: "GET",
        headers: {
            'content-type' : 'application/json'
        }
    }

    // Make API call for Ethereum data
    let response = await axios.get(COINGECKO_URL + API_ENDPOINT, options); // Fetch Ethereum data

    // If error is found, return error
    // If not, return Ethereum price data
    if (response.status !== 200){
        throw new Error("Could not fetch data related to the Ethereum network"); // Throw error if no success
    }
    else {
        return response.data.ethPricedata;
    }
}
