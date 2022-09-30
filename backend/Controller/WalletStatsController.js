require('dotenv').config({ path: '../.env'});
const axios = require('axios');
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const NETWORK_MAPPER = require('../Utils/NetworkMapper').NETWORK_MAPPER;

const mod = "account";
const action = "balance";
const tag = "latest";
const startBlock = 0;
const endBlock = 99999999;
const page = 1;
const sort = 'desc';

exports.addressDetails = (req, res) => {
    const { address, network } = JSON.parse(req.body.body);

    // Gather wallet analytics using API resources and running checks to see if wallet address is valid
    axios.get(NETWORK_MAPPER[network] + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + 
    (network === 'polygon' ? process.env.POLYGON_API_KEY : process.env.ETHERSCAN_API_KEY))
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));

}

exports.transactionsByAddress = (req, res) => {
    const { address, network } = JSON.parse(req.body.body);

    // Transactions of a particular account, if the address of the particular one entered is valid
    axios.get(NETWORK_MAPPER[network] + '?module=' + mod + "&action=txlist&address=" + address + "&startblock=" + startBlock 
    + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + 
    (network === 'polygon' ? process.env.POLYGON_API_KEY : process.env.ETHERSCAN_API_KEY))
    .then(response => res.status(200).json({ information: response.data }))
    .catch(err => res.status(400).json({ information: err }));

}

exports.addressERC20Holdings = (req, res) => {
    const { address, network } = JSON.parse(req.body.body);

    if (network === 'sepolia') { // Exit with a response of a warning flag, no Sepolia testnet access on Moralis
        res.status(200).json({
            information: { warning : 'Sepolia' }
        });
    }

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network;
    const ERC20TOKEN_ENDPOINT = '/erc20?chain=' + refinedNetwork;

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        }
    }

    // ERC20 endpoint for retrieving information related to holdings
    axios.get(MORALIS_URL + address + ERC20TOKEN_ENDPOINT, options)
    .then(response => { 
        console.log(response)
        res.status(200).json({ 
            information: response.data 
        })
    })
    .catch(err => 
        res.status(400).json({ 
            information: err 
    }));
}

exports.addressERC721Holdings = (req, res) => {
    const { address, network } = JSON.parse(req.body.body);
    
    if (network === 'sepolia') { // Exit with a response of a warning flag, no Sepolia testnet access on Moralis
        res.status(200).json({
            information: { warning : 'Sepolia' }
        });
    }

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network;
    const NFT_ENDPOINT = '/nft?chain=' + refinedNetwork + '&format=decimal';

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'X-API-KEY': process.env.MORALIS_API_KEY
        }
    }

    // ERC721 endpoint for retrieving information related to holdings
    axios.get(MORALIS_URL + address + NFT_ENDPOINT, options)
    .then(response => {
        console.log(response);
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            information: err
        })
    })
}