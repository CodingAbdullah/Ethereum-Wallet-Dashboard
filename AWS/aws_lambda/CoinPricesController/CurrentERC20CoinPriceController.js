require('dotenv').config({ path: '../.env' });
const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const { contract } = JSON.parse(event.body); // Adjusted for Lambda event structure
    
    // Endpoint for fetching ERC20 token price
    const ERC20_PRICE_ENDPOINT = '/simple/token_price/ethereum?contract_addresses=' + contract + '&vs_currencies=usd';

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        }
    }

    // Safely fetching data using axios, escaping with try-catch block
    try {
        let response = await axios.get(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices
        
        // If error is found, throw it
        if (response.status !== 200) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Could not fetch ERC20 coin data"
                })
            };
        } else {
            // Return successful ERC20 token information
            return {
                statusCode: 200,
                body: JSON.stringify({
                    price: response.data[Object.keys(response.data)[0]].usd
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch ERC20 coin price"
            })
        };
    }
}