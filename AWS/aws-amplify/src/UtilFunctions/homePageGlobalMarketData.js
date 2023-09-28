import axios from 'axios';

// Global data lookup
export const homePageGlobalMarketData = async () => {
    const URL = "https://api.coingecko.com/api/v3";
    const GLOBALMARKETDATA_ENDPOINT = '/global';
    let globalMarketData = [];

    let response = await axios.get(URL + GLOBALMARKETDATA_ENDPOINT); // Fetch data related to the global market

    if (response.status !== 200) {
        throw new Error("Could not fetch Global Market Data");
    }
    else {
        globalMarketData.push(response.data);
    }

    return globalMarketData;
}