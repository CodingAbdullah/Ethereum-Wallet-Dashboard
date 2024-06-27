require('dotenv').config({ path: '../.env'});
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const axios = require('axios');

exports.getAddressTokenHoldings = (req, res) => { 
    const { address, network } = JSON.parse(req.body.body); // Get address for request to Moralis

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network; // Filter network based on name and remove hashes

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + address + '/nft?chain=' + refinedNetwork + '&format=decimal', options) // Pass in address and chain values
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

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network; // Filter network based on name and remove hashes

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + address + '/nft/transfers?chain=' + refinedNetwork + '&format=decimal&direction=both', options) // Pass in address and chain values
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

exports.getERC721CollectionHoldings = (req, res) => { 
    const { address, network } = JSON.parse(req.body.body); // Get address for request to Moralis

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get('https://deep-index.moralis.io/api/v2.2/' + address + '/nft/collections?chain=' + network, options) // Pass in address and chain values
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(err => 
        res.status(400).json({
            information: err
        })
    );
}   