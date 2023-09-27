import axios from 'axios';

export const metricsNavbarEthPrice = async () => {
    const COINGECKO_URL = "https://api.coingecko.com/api/v3";
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    let ethPricedata = [];

    let response = await axios.get(COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM); // Fetch Ethereum data

    if (response.status !== 200){
        throw new Error("Could not fetch data related to the Ethereum network"); // Throw error if no success
    }
    else {
        ethPricedata.push(response.data);
    }

    return ethPricedata;
}
