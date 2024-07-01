import axios from 'axios';

// Function for fetching top/bottom coin prices using a custom back-end API
export const ERC20TopCoins = async () => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/top-erc20-tokens';

    // Fetching coin data from the custom back-end API
    let response = await axios.get(URL + API_ENDPOINT);

    if (response.status === 200) {
        return response.data.information;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   