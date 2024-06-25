import axios from 'axios';

// Function for fetching coin prices using a custom back-end API
export const coinInfoPro = async ({ queryKey }) => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/coin-information';

    let options = {
        method: "POST",
        body: JSON.stringify({ coin: queryKey[1] }),
        headers: {
            'content-type' : 'application/json'
        }
    }

    // Fetching coin data from the custom back-end API
    let response = await axios.post(URL + API_ENDPOINT, options);

    if (response.status === 200) {
        return response.data.coinInfoData;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   