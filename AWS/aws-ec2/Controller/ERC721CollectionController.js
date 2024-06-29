require('dotenv').config({ path: '../.env'});
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const ALCHEMY_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.alchemy_url;
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs
const axios = require('axios');

const PRO_COINGECKO_URL = 'https://pro-api.coingecko.com/api/v3/';

exports.getERC721CollectionData = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-api-key' : process.env.MORALIS_API_KEY_2
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));

}

exports.getERC721CollectionExtraData = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        }
    };

    // Run backend request
    axios.get(PRO_COINGECKO_URL + 'nfts/ethereum/contract/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }) );
}

exports.getERC721CollectionTransfers = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    const TRANSFERS_ENDPOINT = '/transfers';

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY_2
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
            'x-api-key' : process.env.MORALIS_API_KEY_2
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

exports.getERC721TopCollections = (req, res) => {

    // Setting options to fetch top collections
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'X-API-Key' : process.env.MORALIS_API_KEY_2
        }
    };

    axios.get("https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections", options)
    .then(response => {
        res.status(200).json({
            topCollections: response.data
        });
    })
    .catch(err => {
        res.status(400).json({
            information: err
        });
    });
}