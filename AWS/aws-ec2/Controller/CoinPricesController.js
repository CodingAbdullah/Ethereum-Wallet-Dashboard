require("dotenv").config({ path: '../.env' });
const axios = require("axios");
const moment = require("moment");

const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3"; // Pro CoinGecko API Endpoint

exports.coinPrices = async (req, res) => {
    const API_ENDPOINT = "/simple/price";
    let coinPrices = [];

    // Display these for each of the cards
    const top15CoinCaps = { 'Avalanche-2': 'AVAL', Bitcoin: 'BTC',  Chainlink: 'LINK', Ethereum: 'ETH' ,  litecoin: 'LTC' ,  binancecoin: 'BNB' ,  Ripple: 'XRP' , 
      algorand: 'ALGO' ,  Cardano: 'ADA' ,  Polkadot: 'DOT', Solana: 'SOL' , Stellar: 'XLM', Dogecoin: 'DOGE' , 
     'matic-network': 'MATIC', Uniswap: 'UNI' }; 

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

    // Fetch data related to each of the coins and push to coin price tracker array
    for (let i = 0; i < Object.keys(top15CoinCaps).length; i++) {

        let response = await axios.get(PRO_COINGECKO_URL + API_ENDPOINT +  "?ids=" + Object.keys(top15CoinCaps)[i] + "&vs_currencies=usd&include_24hr_change=true", options);

        if (response.status !== 200) {
            // Cannot fetch coin data
            res.status(400).json({
                message: "Cannot fetch data"
            });
        }
        else {
            coinPrices.push(response.data);
        }
    }

    // If looped through all the coin data requests, proceed to deliver data back to client
    res.status(200).json({
        coinData: coinPrices
    });    
}

exports.coinPricesByDay = async (req, res) => {
    const { days, coin } = JSON.parse(req.body.body);

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

    let QUERY_STRING_PRICES = `?vs_currency=usd&days=${days}`; // Default selection for now.
    let PRICE_ENDPOINT = "/coins/" + coin + "/market_chart" + QUERY_STRING_PRICES + "&interval=daily";
    let coinPricesByInterval = {};

    let response = await axios.get(PRO_COINGECKO_URL + PRICE_ENDPOINT, options); // Fetch coin prices by interval

    if (response.status !== 200) {
        res.status(400).json({
            message: "Could not fetch data"
        });
    }
    else {
        let dayArray = [];
        for (var i = 1; i < days + 1; i++){
            // Fetch the x number to determine interval. If 24, it is set to hourly and if 14 or 30, it is daily
            dayArray.push(moment().subtract(i, 'days').calendar());
        }

        // Set the coin prices by interval object
        coinPricesByInterval.time = dayArray.reverse();
        coinPricesByInterval.coinData = response.data;

        res.status(200).json({
            coinPricesByDay: coinPricesByInterval
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

    let response = await axios.get(PRO_COINGECKO_URL + CURRENCY_ENDPOINT + QUERY_STRING, options); // Fetch current coin price

    // If response is not correct, throw Error
    // If not, return coin data
    if (response.status !== 200) {
        res.status(400).json({
            message: "Could not fetch coin price data"
        });
    }
    else {
        coinInfo.push(response.data);
        res.status(200).json({
            coinInfoData: coinInfo
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

exports.ERC20CoinPriceDuration = async (req, res) => {
    const { contract } = JSON.parse(req.body.body);

    // Request ERC20 token prices
    const ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + contract + '/market_chart?vs_currency=usd&days=0.05';
    let coinPricesByInterval = {};

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

    let response = await axios.get(PRO_COINGECKO_URL + ERC20_PRICE_ENDPOINT, options); // Fetch ERC20 token prices by interval

    if (response.status !== 200) {
        res.status(400).json({
            message: "Could not fetch ERC20 price duration data"
        });
    }
    else {
        let days = [];
        for (var i = 1; i < 16; i++){
            // Fetch the x number to determine interval. If 24, it is set to hourly and if 14 or 30, it is daily
            days.push(moment().subtract(i, 'days').calendar());
        }

        // Set the coin prices by interval object
        coinPricesByInterval.time = days.reverse();
        coinPricesByInterval.coinData = response.data;

        res.status(200).json({
            ERC20PriceDurationData: coinPricesByInterval
        });  
    }  
}

exports.homePageBitcoinPrice = async (req, res) => {
    const QUERY_STRING_BITCOIN = "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
    const API_ENDPOINT = "/simple/price";
    let btcPriceData = [];

    // Setting options for authenticated API call
    let options = {
        method: "GET",
        mode: 'cors', // *cors, same-origin
        headers : {
            'content-type' : 'application/json',
            'access-control-allow-origin': '*',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY // API-KEY for authenticated call
        }
    }

    let response = await axios.get(PRO_COINGECKO_URL + API_ENDPOINT + QUERY_STRING_BITCOIN, options); // Fetch Ethereum data

    // If error is found, return it as a response
    if (response.status !== 200){
        res.status(400).json({
            message: "Could not fetch Bitcoin data for home page"
        });
    }
    else {

        // Return back as response, bitcoin price data
        btcPriceData.push(response.data);
        res.status(200).json({
            btcPriceData
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

    let response = await axios.get(PRO_COINGECKO_URL + GLOBALMARKETDATA_ENDPOINT, options); // Fetch data related to the global market

    // If error is found, return error response
    if (response.status !== 200) {
        res.status(400).json({
            message: "Could not fetch global market data"
        });
    }
    else {

        // Send back as response, global market data
        globalMarketData.push(response.data);

        res.status(200).json({
            globalMarketData
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

    let response = await axios.get(PRO_COINGECKO_URL + TRENDINGCOINS_ENDPOINT, options); // Fetch data related to trending coins

    // Throw error if data could not be fetched
    if (response.status !== 200) {
        res.status(400).json({
            message: "Could not fetch trending coins data"
        });
    }
    else {
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
            trendingCoinData
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

    let response = await axios.get(PRO_COINGECKO_URL + API_ENDPOINT + QUERY_STRING_ETHEREUM, options); // Fetch Ethereum data

    if (response.status !== 200){
        res.status(400).json({
            message: "Could not fetch Ethereum Navbar data"
        });
    }
    else {
        ethPricedata.push(response.data);
        res.status(200).json({
            ethPricedata
        });
    }
}