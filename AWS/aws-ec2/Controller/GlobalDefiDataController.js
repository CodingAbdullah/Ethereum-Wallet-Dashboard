require('dotenv').config({ path: '../.env' });
const axios = require("axios");

// Pro CoinGecko API Endpoint
const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";

exports.globalDefiData = (req, res) => {
    const DEFI_ENDPOINT = "/global/decentralized_finance_defi";
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    // Pass in address and chain values
    axios.get(PRO_COINGECKO_URL + DEFI_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

// Endpoint for trending pools data
exports.trendingPoolsData = (req, res) => {
    const TRENDING_POOLS_ENDPOINT = '/onchain/networks/trending_pools';
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    // Pass in address and chain values
    axios.get(PRO_COINGECKO_URL + TRENDING_POOLS_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

// Endpoint for trending Ethereum pools data
exports.trendingETHPoolsData = (req, res) => {
    const ETHEREUM_TRENDING_POOLS_ENDPOINT = '/onchain/networks/eth/trending_pools';

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    // Pass in address and chain values
    axios.get(PRO_COINGECKO_URL + ETHEREUM_TRENDING_POOLS_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

// Endpoint for the new network Ethereum pool data
exports.NewNetworkETHPoolData = (req, res) => {
    const NEW_NETWORK_ETH_POOL_ENDPOINT = '/onchain/networks/eth/new_pools';

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'x-cg-pro-api-key' : process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    // Pass in address and chain values
    axios.get(PRO_COINGECKO_URL + NEW_NETWORK_ETH_POOL_ENDPOINT, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}