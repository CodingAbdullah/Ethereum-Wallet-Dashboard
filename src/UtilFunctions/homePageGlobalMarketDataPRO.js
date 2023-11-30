import axios from 'axios';

// Global data lookup
export const homePageGlobalMarketDataPro = async () => {
    const URL = "http://localhost:5000";
    const GLOBALMARKETDATA_ENDPOINT = '/global-market-data';

    let response = await axios.get(URL + GLOBALMARKETDATA_ENDPOINT); // Fetch data related to the global market

    if (response.status !== 200) {
        throw new Error("Could not fetch Global Market Data");
    }
    else {
        return response.data.globalMarketData;
    }
}