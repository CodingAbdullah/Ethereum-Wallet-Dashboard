require('dotenv').config({ path: '../.env'});
const axios = require('axios');
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;

exports.getAddressTokenHoldings = (req, res) => { 
    const { address, network } = JSON.parse(req.body.body); // Get address for request to Moralis

    let refinedNetwork = (network === 'polygon-mumbai' ? 'mumbai' : network);

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + address + '/erc20?chain=' + refinedNetwork, options) // Pass in address and chain values
    .then(response => {
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => 
        res.status(400).json({
            information: err
        })
    );
}   

exports.getAddressTokenTransfers = (req, res) => { 
    const { address, network } = JSON.parse(req.body.body); // Get address for request to Moralis

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network;

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + address + '/erc20/transfers?chain=' + refinedNetwork, options) // Pass in address and chain values
    .then(response => {
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => 
        res.status(400).json({
            information: err
        })
    );
}   