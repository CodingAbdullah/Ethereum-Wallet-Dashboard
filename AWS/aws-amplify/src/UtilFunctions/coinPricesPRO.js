import axios from 'axios';

// Function for fetching coin prices using a custom back-end API
export const coinPricesPro = async () => {
    const URL = 'https://18.221.208.44.nip.io';
    const API_ENDPOINT = '/coin-prices';

    // Fetching coin data from the custom back-end API
    let response = await axios.get(URL + API_ENDPOINT);

    if (response.status === 200) {
        return response.data.coinData;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   