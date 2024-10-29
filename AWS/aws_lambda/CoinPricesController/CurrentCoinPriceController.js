const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const { coin } = JSON.parse(event.body); // Adjusted for Lambda event structure

    // QUERY STRING along with CURRENCY ENDPOINT
    const QUERY_STRING = '?ids=' + coin + '&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        }
    }

    let coinInfo = [];

    // Fetch current coin price information using the coin ID provided by user
    try {
        let response = await axios.get(PRO_COINGECKO_URL + CURRENCY_ENDPOINT + QUERY_STRING, options); // Fetch current coin price
        
        coinInfo.push(response.data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                coinInfoData: coinInfo
            })
        };
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "ERROR: "
            })
        };
    }
}