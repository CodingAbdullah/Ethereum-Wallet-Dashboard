require('dotenv').config({ path: '../.env' });
const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    let ethPricedata = [];

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_NAVBAR_API_KEY // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM, options); // Fetch Ethereum data
        
        ethPricedata.push(response.data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                ethPricedata
            })
        };
    } 
    catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch Ethereum Navbar data"
            })
        };
    }
}