const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const COIN_PRICES_ENDPOINT = "/coins/markets?vs_currency=usd&order=market_cap_desc";

    // Setting headers to pass in COINGECKO API KEY (x-cg-pro-api-key)
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_PRICES_API_KEY
        }
    }

    // Make an API call to fetch all the coins supported by CoinGecko
    try {
        let response = await axios.get(PRO_COINGECKO_URL + COIN_PRICES_ENDPOINT, options);
        return {
            statusCode: 200,
            body: JSON.stringify({
                coinData: response.data
            })
        };
    } 
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({})
        };
    }
}