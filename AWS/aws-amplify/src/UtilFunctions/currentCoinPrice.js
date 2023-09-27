import axios from 'axios';
    
// Check to see if the parameters exist and are valid, run to check prices, selection area for the different coins
const URL = "https://api.coingecko.com/api/v3";
const CURRENCY_ENDPOINT = '/simple/price';

export const currentCoinPrice = async ({ queryKey }) => {
    let QUERY_STRING = '?ids=' + queryKey[1] + '&vs_currencies=usd&include_24hr_change=true';
    let coinInfo = [];

    let response = await axios.get(URL + CURRENCY_ENDPOINT + QUERY_STRING); // Fetch current coin price

    // If response is not correct, throw Error
    if (response.status !== 200) {
        throw new Error("Could not make current coin price request");
    }
    else {
        coinInfo.push(response.data);
    }

    return coinInfo;
}