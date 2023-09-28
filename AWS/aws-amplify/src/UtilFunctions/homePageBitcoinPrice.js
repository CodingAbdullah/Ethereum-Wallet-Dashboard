import axios from 'axios';

export const homePageBitcoinPrice = async () => {
    const COINGECKO_URL = "https://api.coingecko.com/api/v3";
    const QUERY_STRING_BITCOIN = "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    let btcPriceData = [];

    let response = await axios.get(COINGECKO_URL + API_ENDPOINT + QUERY_STRING_BITCOIN); // Fetch Ethereum data

    if (response.status !== 200){
        throw new Error("Could not fetch data related to the Ethereum network"); // Throw error if no success
    }
    else {
        btcPriceData.push(response.data);
    }

    return btcPriceData;
}
