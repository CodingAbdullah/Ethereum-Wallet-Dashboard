const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";
const DEFI_ENDPOINT = "/global/decentralized_finance_defi";

exports.handler = async (event) => {
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_HOME_PAGE_API_KEY_3
        }
    };

    try {
        const response = await axios.get(PRO_COINGECKO_URL + DEFI_ENDPOINT, options);
        return {
            statusCode: 200,
            body: JSON.stringify({ information: response.data }),
            headers: { 'Content-Type': 'application/json' }
        };
    } 
    catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};