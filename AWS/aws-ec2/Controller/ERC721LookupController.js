require('dotenv').config({ path: '../.env' });
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const ALCHEMY_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.alchemy_url;
const OPENSEA_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.opensea_url;
const axios = require('axios');

// Retrieve sales information of an ERC721 token
exports.erc721SalesById = (req, res) => {
    const { address, id } = JSON.parse(req.body.body); // Parse information for make API call

    const params = {
        "chain_id": "ethereum",
        "contract_address": address,
        "token_id": id
    }
    
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } 
    }

    // Making request to Transpose API for finding ERC721 token sales information
    axios.get("https://api.transpose.io/nft/sales-by-token-id?" + new URLSearchParams(params), options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(err => {
        res.status(400).json({
            information: err
        });
    });
}

// Retrieve lookup information related to ERC721 token
exports.erc721TokenLookup = (req, res) => {
    const { address, id, network } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    // Making request to Moralis API for finding ERC721 token information
    axios.get(MORALIS_URL + 'nft/' + address + "/" + id + "?chain=" + network + "&format=decimal", options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

// Retrieve ERC721 token transfer information
exports.erc721TokenTransferLookup = (req, res) => {
    const { address, id, network } = JSON.parse(req.body.body);

    const LOOKUP_ENDPOINT = '/transfers';

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        }
    }

    // Making request to Moralis API for finding ERC721 token transfer information
    axios.get(MORALIS_URL + 'nft/' + address + "/" + id + LOOKUP_ENDPOINT + "?chain=" + network + "&format=decimal", options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

// Retrieve ERC721 token rarity information
exports.erc721TokenRarityLookup = (req, res) => {
    const { address, id, network } = JSON.parse(req.body.body);

    if (network !== 'eth') {
        // Throw an alert on this message
        res.status(200).json({
            information: { data: null } 
        });
    }
    else {
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        };

        // Making request to Alchemy API for finding ERC721 token rarity
        axios.get(ALCHEMY_URL + '/' + process.env.ALCHEMY_API_KEY_1 + "/computeRarity?contractAddress=" + address + "&tokenId=" + id, options)
        .then(response => {
            res.status(200).json({
                information: { data: response.data }
            });
        })
        .catch(err => {
            res.status(400).json({
                information: err 
            });
        });
    }
}

// Retrieve Opensea information related to ERC721 token
exports.erc721TokenOpenseaInformation = (req, res) => {
    const { address, id, network } = JSON.parse(req.body.body);

    // If the holesky testnet is requested, return response with no information
    if (network === 'holesky') {
        res.status(200).json({
            information: []
        });
    }
    else {
        // Setting options to make authenticated API calls to retrieve ERC721 token information
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'accept' : 'application/json',
                'X-API-KEY' : process.env.OPENSEA_API_KEY
            }
        };

        // Making request to Opensea API to retrieve ERC721 token information
        axios.get(OPENSEA_URL + 'chain/' + (network === 'eth' ? 'ethereum' : network) +  "/contract/" + address + '/nfts/' + id, options)
        .then(response => {
            res.status(200).json({
                information: [response.data]
            });
        })
        .catch(err => {
            res.status(400).json({
                information: err
            });
        });
    }
}