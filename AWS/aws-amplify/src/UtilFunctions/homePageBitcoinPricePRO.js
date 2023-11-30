import axios from 'axios';

export const homePageBitcoinPricePro = async () => {
    const COINGECKO_URL = "http://localhost:5000";
    const API_ENDPOINT = "/homepage-bitcoin-price";

    // Setting options for API call
    let options = {
        method: 'GET',
        headers : {
            'content-type': 'application/json'
        }
    }

    let response = await axios.get(COINGECKO_URL + API_ENDPOINT, options); // Fetch Ethereum data

    if (response.status !== 200){
        throw new Error("Could not fetch data related to the Ethereum network"); // Throw error if no success
    }
    else {
        return response.data.btcPriceData;
    }
}
