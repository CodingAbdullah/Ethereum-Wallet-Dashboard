import axios from 'axios';
    
// Check to see if the parameters exist and are valid, run to check prices, selection area for the different coins
export const currentCoinPricePro = async ({ queryKey }) => {
    const URL = "http://localhost:5000";
    const CURRENCY_ENDPOINT = '/simple-price-data';

    let options = {
        method: "POST",
        body: JSON.stringify({ coin: queryKey[1] }),
        headers: {
            'content-type' : 'application.json'
        }
    }

    let response = await axios.post(URL + CURRENCY_ENDPOINT, options); // Fetch current coin price

    // If response is not correct, throw Error
    if (response.status !== 200) {
        throw new Error("Could not make current coin price request");
    }
    else {
        return response.data.coinInfoData;
    }
}