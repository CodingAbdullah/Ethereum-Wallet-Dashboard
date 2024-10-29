require("dotenv").config({ path: '../.env' });
const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

// Fetch top coins by gains and losses for the day
exports.handler = async (event) => { // Lambda entry point
    const TOP_BOTTOM_COINS_ENDPOINT = "/coins/top_gainers_losers?vs_currency=usd";
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_CHART_DATA_API_KEY
        }
    }

    // Make an API call to fetch top and bottom coins
    try {
        let response = await axios.get(PRO_COINGECKO_URL + TOP_BOTTOM_COINS_ENDPOINT, options);
        return {
            statusCode: 200,
            body: JSON.stringify({
                topBottomCoins: response.data
            })
        };
    } 
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch top and bottom coins data"
            })
        };
    }
}