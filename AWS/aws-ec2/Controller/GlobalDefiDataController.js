require('dotenv').config({ path: '../.env' });
const axios = require("axios");

// Pro CoinGecko API Endpoint
const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";

exports.globalDefiData = (req, res) => {
    const DEFI_ENDPOINT = "/global/decentralized_finance_defi";
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    // Pass in address and chain values
    axios.get(PRO_COINGECKO_URL + DEFI_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}