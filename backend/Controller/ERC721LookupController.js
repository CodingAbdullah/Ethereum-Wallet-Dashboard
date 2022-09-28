require('dotenv').config({ path: '../.env' });
const sdk = require('api')('@transpose/v0#klm8731l7j8jla0'); // Unique identifier for Transpose APIs found in docs
const MORALIS_URL = require('../Utils/APIURLReference').MORALIS_URL;
const ALCHEMY_URL = require('../Utils/APIURLReference').ALCHEMY_URL;
const axios = require('axios');

exports.erc721SalesById = (req, res) => {
    const { address, id } = JSON.parse(req.body.body); // Parse information for make API call

    sdk.get('/sales-by-token-id?contract_address=' + address + '&token_id=' + id + '&order=desc', { 'x-api-key': process.env.TRANSPOSE_API_KEY })
    .then(response => res.status(200).json({ information: response }))
    .catch(err => res.status(400).json({ information: err }))
}

exports.erc721TokenLookup = (req, res) => {
    const { address, id } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + 'nft/' + address + "/" + id + "?chain=eth&format=decimal", options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.erc721TokenTransferLookup = (req, res) => {
    const { address, id } = JSON.parse(req.body.body);

    const LOOKUP_ENDPOINT = '/transfers';

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    axios.get(MORALIS_URL + 'nft/' + address + "/" + id + LOOKUP_ENDPOINT + "?chain=eth&format=decimal", options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.erc721TokenRarityLookup = (req, res) => {
    const { address, id } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    };

    // API endpoint for finding the rarity
    axios.get(ALCHEMY_URL + '/' + process.env.ALCHEMY_API_KEY + "/computeRarity?contractAddress=" + address + "&tokenId=" + id, options)
    .then(response => {
        res.status(200).json({
            information: { data: response.data } 
        })
    })
    .catch(err => {
        console.log(err);
    })
}