require('dotenv').config({ path: '../.env' });
const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const GLOBALMARKETDATA_ENDPOINT = '/global';
    let globalMarketData = [];

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_HOME_PAGE_API_KEY_2 // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + GLOBALMARKETDATA_ENDPOINT, options); // Fetch data related to the global market
        
        // Send back as response, global market data
        globalMarketData.push(response.data);

        return {
            statusCode: 200,
            body: JSON.stringify({
                globalMarketData
            })
        };
    } 
    catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch global market data"
            })
        };
    }
}