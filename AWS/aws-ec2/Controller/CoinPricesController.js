require("dotenv").config({ path: '../.env' });
const axios = require("axios");
const dayjs = require("dayjs");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.coinPrices = (req, res) => {
    const COIN_PRICES_ENDPOINT = "/coins/markets?vs_currency=usd&order=market_cap_desc";

    // Setting headers to pass in COINGECKO API KEY (x-cg-pro-api-key)
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_PRICES_API_KEY
        }
    }

    // Make an API call to fetch all the coins supported by CoinGecko
    axios.get(PRO_COINGECKO_URL + COIN_PRICES_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            coinData: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    })   
}

// Fetch top coins by gains and losses for the day
exports.topBottomCoins = (req, res) => {
    const TOP_BOTTOM_COINS_ENDPOINT = "/coins/top_gainers_losers?vs_currency=usd";
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_CHART_DATA_API_KEY
        }
    }

    // Make an API call to fetch top and bottom coins
    axios.get(PRO_COINGECKO_URL + TOP_BOTTOM_COINS_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            topBottomCoins: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

// Coin price duration by interval selection
exports.coinPriceDuration = async (req, res) => {
    const { coin, interval } = JSON.parse(req.body.body);

    // Request coin prices
    let COIN_PRICE_ENDPOINT = '/coins/' + coin;

    if (interval === '24') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=2';
    }
    else if (interval === '7') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=7&interval=daily';
    }
    else if (interval === '14') {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=14&interval=daily';
    }
    else {
        COIN_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=30&interval=daily';
    }

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        }
    }

    // Safely fetching data using axios, escaping with try-catch block
    try {
        let response = await axios.get(PRO_COINGECKO_URL + COIN_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval

        if (response.status !== 200) {
            res.status(400).json({
                message: "Could not fetch coin price duration data"
            });
        }
        else {
            // Conditionally send the response and format it conforming to the interval
            // Incorporate the dayjs library for easy date formatting
            let prices = response.data.prices;
            if (interval === '24'){
                res.status(200).json({
                    coinPrices: prices.map(price => ({ 
                        time: dayjs(price[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[1], 
                        price: Number(Number(price[1])) 
                    })).splice(24) 
                });
            }
            else {
                res.status(200).json({
                    coinPrices: prices.map(price => ({ 
                        time: dayjs(price[0]).format('YYYY-MM-DD'), 
                        price: Number(Number(price[1])) 
                    }))
                });
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Could not fetch coin price duration data"
        });
    }
}

exports.currentCoinPrice = async (req, res) => {
    const { coin } = JSON.parse(req.body.body);

    // QUERY STRING along with CURRENCY ENDPOINT
    const QUERY_STRING = '?ids=' + coin + '&vs_currencies=usd&include_24hr_change=true';
    const CURRENCY_ENDPOINT = '/simple/price';
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        }
    }

    let coinInfo = [];

    // Fetch current coin price information using the coin ID provided by user
    try {
        let response = await axios.get(PRO_COINGECKO_URL + CURRENCY_ENDPOINT + QUERY_STRING, options); // Fetch current coin price
        
        coinInfo.push(response.data);
        res.status(200).json({
            coinInfoData: coinInfo
        });
    }
    catch (err) {
        res.status(400).json({
            message: "ERROR: "
        });
    }
}

exports.coinInformation = async (req, res) => {
    const { coin } = JSON.parse(req.body.body);

    // QUERY STRING along with CURRENCY ENDPOINT
    const CURRENCY_ENDPOINT = '/coins/' + coin;
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY // API-KEY for authenticated call
        }
    }

    let coinInfo = [];

    // Fetch coin information using the coin ID provided by the user
    try {
        let response = await axios.get(PRO_COINGECKO_URL + CURRENCY_ENDPOINT, options); // Fetch coin information   
        
        coinInfo.push(response.data);
        res.status(200).json({
            coinInfoData: coinInfo
        });
    }
    catch(err) {
        res.status(400).json({
            message: "ERROR: "
        });
    }
}

exports.currentERC20CoinPrice = async (req, res) => {
    const { contract } = JSON.parse(req.body.body);
    
    // Endpoint for fetching ERC20 token price
    const ERC20_PRICE_ENDPOINT = '/simple/token_price/ethereum?contract_addresses=' + contract + '&vs_currencies=usd';

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        }
    }

    // Safely fetching data using axios, escaping with try-catch block
    try {
        let response = await axios.get(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval
        
        // If error is found, throw it
        if (response.status !== 200) {
            res.status(400).json({
                message: "Could not fetch ERC20 coin data"
            });
        }
        else {
            // Return successful ERC20 token information
            res.status(200).json({
                price: response.data[Object.keys(response.data)[0]].usd
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Could not fetch ERC20 coin price"
        });
    }
}

exports.ERC20CoinInfo = async (req, res) => {
    const { contract } = JSON.parse(req.body.body);

    // Request ERC20 token information
    const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + contract;

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        }
    }

    // Safely fetching data using axios, escaping with try-catch block
    try {
        let response = await axios.get(PRO_COINGECKO_URL + ERC20_INFO_ENDPOINT, options); // Fetch ERC20 token prices by interval

        // If error is found, throw it
        if (response.status !== 200) {
            res.status(400).json({
                message: "Could not fetch ERC20 coin data"
            });
        }
        else {
            // Return successful ERC20 token information
            res.status(200).json({
                ERC20CoinData: response.data
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Could not fetch ERC20 coin data"
        });
    }
}

exports.ERC20CoinPriceDuration = async (req, res) => {
    const { contract, interval } = JSON.parse(req.body.body);

    // Request ERC20 token prices
    let ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + contract;

    if (interval === '24') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=2';
    }
    else if (interval === '7') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=7&interval=daily';
    }
    else if (interval === '14') {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=14&interval=daily';
    }
    else {
        ERC20_PRICE_ENDPOINT += '/market_chart?vs_currency=usd&days=30&interval=daily';
    }

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_ERC20_PRICES_API_KEY // API-KEY for authenticated call
        }
    }

    // Safely fetching data using axios, escaping with try-catch block
    try {
        let response = await axios.get(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval

        if (response.status !== 200) {
            res.status(400).json({
                message: "Could not fetch ERC20 price duration data"
            });
        }
        else {
            // Conditionally send the response and format it conforming to the interval
            // Incorporate the dayjs library for easy date formatting
            let prices = response.data.prices;
            if (interval === '24'){
                res.status(200).json({
                    coinPrices: prices.map(price => ({ 
                        time: dayjs(price[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[1], 
                        price: Number(Number(price[1])) 
                    })).splice(24) 
                });
            }
            else {
                res.status(200).json({
                    coinPrices: prices.map(price => ({ 
                        time: dayjs(price[0]).format('YYYY-MM-DD'), 
                        price: Number(Number(price[1])) 
                    }))
                });
            }
        }  
    }
    catch (error) {
        res.status(400).json({
            message: "Could not fetch ERC20 coin price duration data"
        });
    }
}

exports.homePageGlobalMarketData = async (req, res) => {
    const GLOBALMARKETDATA_ENDPOINT = '/global';
    let globalMarketData = [];

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_2 // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + GLOBALMARKETDATA_ENDPOINT, options); // Fetch data related to the global market
        
        // Send back as response, global market data
        globalMarketData.push(response.data);

        res.status(200).json({
            globalMarketData
        });
    }
    catch (err) {
        res.status(400).json({
            message: "Could not fetch global market data"
        });
    }
}

exports.navbarEthPrice = async (req, res) => {
    const QUERY_STRING_ETHEREUM = "?ids=ethereum&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";

    let ethPricedata = [];

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_NAVBAR_API_KEY // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM, options); // Fetch Ethereum data
        
        ethPricedata.push(response.data);
        res.status(200).json({
            ethPricedata
        });
    }
    catch (err) {
        res.status(400).json({
            message: "Could not fetch Ethereum Navbar data"
        });
    }
}

exports.homePageTrendingCoins = async (req, res) => {
    const TRENDINGCOINS_ENDPOINT = '/search/trending'; // Trending coins in the market
    let trendingCoinData = "";
    
    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3 // API-KEY for authenticated call
        }
    }

    try {
        let response = await axios.get(PRO_COINGECKO_URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins
            
        // Format display data and return back to client
        let information = '';
        for (var i = 0; i < response.data.coins.length - 2; i++){ 
            information += response.data.coins[i].item.name;
            information += ' - ';
            information += response.data.coins[i].item.symbol;
            trendingCoinData += information;
            information = ' | ';
        }

        // Send back as response, trending coin data
        res.status(200).json({
            trendingCoinData: response.data
        });
    }
    catch (err) {
        // Throw error if data could not be fetched
        res.status(400).json({
            message: "Could not fetch trending coins data"
        });
    }
}