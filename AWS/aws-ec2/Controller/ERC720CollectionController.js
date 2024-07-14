require('dotenv').config({ path: '../.env'});
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const axios = require('axios');

const erc20Endpoint = 'erc20/';

exports.getTopERC20Tokens = (req, res) => {
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    // Retrieve top ERC20 tokens by market cap
    axios.get('https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-tokens', options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getTokenPrice = (req, res) => { 
    const { address } = JSON.parse(req.body.body); // Get address for request to Moralis
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + erc20Endpoint + address + '/price', options) // Pass in address and chain values
    .then(response => {
        res.status(200).json({
            information: response.data
        })
    })
    .catch(() => {
        res.status(400).json({});
    });
}
    
exports.getTokenTransfer = (req, res) => {
    const { contract } = JSON.parse(req.body.body); // Get address for request to Moralis
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY_2
        } 
    }

    axios.get("https://deep-index.moralis.io/api/v2.2/erc20/" + contract + '/transfers', options) // Pass in address value for request
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getTokenOwners = (req, res) => {
    const { contract } = JSON.parse(req.body.body); // Get address for request to Moralis
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY_2
        } 
    }

    axios.get("https://deep-index.moralis.io/api/v2.2/erc20/" + contract + '/owners', options) // Pass in address values for request
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}