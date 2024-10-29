require('dotenv').config({ path: '../.env' });
const axios = require("axios");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // Trending coins in the market
    let trendingCoinData = "";

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key': process.env.COINGECKO_HOME_PAGE_API_KEY_3 // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins
            
        // Format display data and return back to client
        let information = '';
        for (var i = 0; i < response.data.coins.length - 2; i++) { 
            information += response.data.coins[i].item.name;
            information += ' - ';
            information += response.data.coins[i].item.symbol;
            trendingCoinData += information;
            information = ' | ';
        }

        // Send back as response, trending coin data
        return {
            statusCode: 200,
            body: JSON.stringify({
                trendingCoinData: response.data
            })
        };
    } 
    catch (err) {
        // Throw error if data could not be fetched
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch trending coins data"
            })
        };
    }
}