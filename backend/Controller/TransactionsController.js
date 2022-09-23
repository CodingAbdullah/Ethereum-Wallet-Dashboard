require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const ETHERSCAN_URL = "https://api.etherscan.io/api";
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
    
    axios.get(ETHERSCAN_URL + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + API_KEY)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}

exports.getAddressTransactionHistory = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    axios.get(ETHERSCAN_URL + '?module=' + mod + "&action=txlist&address=" + address + "&startblock=" + startBlock 
    + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + API_KEY)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));
}