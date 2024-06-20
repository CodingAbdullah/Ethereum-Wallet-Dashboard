require('dotenv').config({ path: '../.env' });
const ETHERSCAN_ETH_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.eth;
const OPENSEA_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.opensea_url;
const axios = require('axios');

const mod = "account";
const action = "balance";
const tag = "latest";
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
const startBlock = 0;
const endBlock = 99999999;
const page = 1;
const sort = 'desc';

exports.getAddressTransactionBalance = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    
    axios.get(ETHERSCAN_ETH_URL + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + API_KEY)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getAddressTransactionHistory = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Gather list of transactions in descending order
    axios.get(ETHERSCAN_ETH_URL + '?module=' + mod + "&action=txlist&address=" + address + "&startblock=" + startBlock 
    + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + API_KEY)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getAddressInternalTransactionHistory = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Gather data about internal transactions (L2.. bridges, etc)
    axios.get(ETHERSCAN_ETH_URL + '?module=' + mod + '&action=txlistinternal&address=' + address + '&startblock=' + startBlock
    + '&endblock=' + endBlock + '&page=' + page + '&offset=' + 1000 + '&sort=' + sort + '&apikey=' + API_KEY) 
    .then(response => { res.status(200).json({ information: response.data })})
    .catch(err => res.status(400).json({ information: err }));
}

exports.openseaAccountInformation = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Set options for making authenticated API calls
    let options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'X-API-KEY': process.env.OPENSEA_API_KEY
        }
    }
    
    // Gather data about Opensea account
    axios.get(OPENSEA_URL + 'accounts/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}