const axios = require("axios");

exports.handler = async (event) => { // Lambda entry point
    const { coin } = JSON.parse(event.body); // Adjusted for Lambda event structure

    // QUERY STRING along with CURRENCY ENDPOINT
    const CURRENCY_ENDPOINT = '/coins/' + coin;

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

    // Fetch coin information using the coin ID provided by the user
    try {
        let response = await axios.get(PRO_COINGECKO_URL + CURRENCY_ENDPOINT, options); // Fetch coin information   
        coinInfo.push(response.data);
        return {
            statusCode: 200,
            body: JSON.stringify({
                coinInfoData: coinInfo
            })
        };
    } 
    catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "ERROR: "
            })
        };
    }
}