import axios from 'axios';

export const metricsNavbarGasPrice = async () => {
    const NODE_SERVER_URL = 'https://18.221.208.44.nip.io/';
    const GAS_TRACKER_ENDPOINT = 'gas-track';

    let gasPriceData = [];

    let response = await axios.get(NODE_SERVER_URL + GAS_TRACKER_ENDPOINT); // Fetch Gas Price

    if (response.status !== 200){
        throw new Error("Could not fetch gas price data"); // Throw error if fetch was unsuccessful
    }
    else {
        gasPriceData.push(response.data);
    }

    return gasPriceData;

}