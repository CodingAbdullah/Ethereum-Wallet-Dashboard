require('dotenv').config({ path: '../.env'});
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const ALCHEMY_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.alchemy_url;
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs
const axios = require('axios');

exports.getERC721CollectionData = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-api-key' : process.env.MORALIS_API_KEY
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));

}

exports.getERC721CollectionTransfers = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    const TRANSFERS_ENDPOINT = '/transfers';

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY 
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address + TRANSFERS_ENDPOINT, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getERC721CollectionSales = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    const TRADES_ENDPOINT = '/trades';

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY 
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address + TRADES_ENDPOINT, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getERC721CollectionFloorPrice = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    
    // Run backend request
    sdk.server(ALCHEMY_URL);

    sdk.getFloorPrice({ apiKey: process.ALCHEMY_API_KEY_1 , contractAddress: address })
    .then(response => res.status(200).json({ information: response }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getERC721CollectionAttributes = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Run backend request
    sdk.server(ALCHEMY_URL);
    
    sdk.summarizeNFTAttributes({ contractAddress: address, apiKey: process.env.ALCHEMY_API_KEY_2 })
    .then(response => { res.status(200).json({ information: response })})
    .catch(err => res.status(400).json({ information: err }));
}