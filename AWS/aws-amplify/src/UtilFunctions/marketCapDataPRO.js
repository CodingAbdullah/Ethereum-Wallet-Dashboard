import axios from 'axios';

// Function for fetching top/bottom coin prices using a custom back-end API
export const marketCapData = async () => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/global-market-cap-chart-data';

    // Fetching coin data from the custom back-end API
    let response = await axios.get(URL + API_ENDPOINT);

    if (response.status === 200) {
        return response.data.capValues;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   