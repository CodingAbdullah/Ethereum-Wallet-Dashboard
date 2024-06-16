import axios from 'axios';

// Global Data Lookup
export const homePageGlobalDefiDataPro = async () => {
    const URL = "https://18.221.208.44.nip.io";
    const GLOBALDEFIDATA_ENDPOINT = '/global-defi-data';
    let globalDefiData = [];

    let response = await axios.get(URL + GLOBALDEFIDATA_ENDPOINT); // Fetch data related to the global market

    if (response.status !== 200) {
        throw new Error("Could not fetch Global Market Data");
    }
    else {
        globalDefiData.push(response.data.information.data);
    }

    return globalDefiData;
}