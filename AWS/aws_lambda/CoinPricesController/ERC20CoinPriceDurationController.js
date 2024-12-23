require('dotenv').config({ path: '../.env' });
const axios = require("axios");
const dayjs = require("dayjs");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.handler = async (event) => { // Lambda entry point
    const { contract, interval } = JSON.parse(event.body); // Adjusted for Lambda event structure

    // Request ERC20 token prices
    let ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + contract;

    if (interval === '24') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=2';
    } else if (interval === '7') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=7&interval=daily';
    } else if (interval === '14') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=14&interval=daily';
    } else {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=30&interval=daily';
    }

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
        let response = await axios.get(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval

        if (response.status !== 200) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Could not fetch ERC20 price duration data"
                })
            };
        } else {
            // Conditionally send the response and format it conforming to the interval
            let prices = response.data.prices;
            if (interval === '24') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        coinPrices: prices.map(price => ({
                            time: dayjs(price[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[1],
                            price: Number(Number(price[1]))
                        })).splice(24)
                    })
                };
            } else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        coinPrices: prices.map(price => ({
                            time: dayjs(price[0]).format('YYYY-MM-DD'),
                            price: Number(Number(price[1]))
                        }))
                    })
                };
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Could not fetch ERC20 coin price duration data"
            })
        };
    }
}