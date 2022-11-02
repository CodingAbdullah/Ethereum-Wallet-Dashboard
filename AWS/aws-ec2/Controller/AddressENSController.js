require('dotenv').config({ path: '../.env' });
const sdk = require('api')('@transpose/v0#3xj19sl7j8jtul'); // Unique identifier for Transpose APIs found in docs
const axios = require('axios');
const MORALIS_URL = require("../Utils/NetworkMapper").NETWORK_MAPPER.moralis_url;

exports.addressToENSInformation = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {   
        method: 'GET', 
        mode: 'cors', // *cors, same-origin
        headers: { 
            'content-type' : 'application/json', 
            'access-control-allow-origin': '*',
            'X-API-KEY' : process.env.MORALIS_API_KEY // Transpose API key hidden 
        }
    }

    axios.get(MORALIS_URL + 'resolve/' + address + "/reverse", options)
    .then(response => {
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => {
        res.status(400).json({
            information: err
        });
    })
}

exports.additionalENSInformation = (req, res) => {
    const { ensName } = JSON.parse(req.body.body);

    sdk.get('/ens-records-by-name?ens_names=' + ensName, { 'x-api-key': process.env.TRANSPOSE_API_KEY_1 })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        })
    })
    .catch(err => {
        res.status(400).json({
            information: err // Send response with status 400 and information
        })
    });
}

exports.ensOwnershipInformation = (req, res) => {
    const { walletAddress } = JSON.parse(req.body.body);

    sdk.get('/ens-records-by-owner?owner_address=' + walletAddress, { 'x-api-key': process.env.TRANSPOSE_API_KEY_2 })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        });
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            information: err // Send response with status 400 and information
        });
    })
}

exports.ensResolverInformation = (req, res) => {
    const { walletAddress } = JSON.parse(req.body.body);

    sdk.get('/ens-records-by-resolved-account?resolved_address=' + walletAddress, { 'x-api-key': process.env.TRANSPOSE_API_KEY_1 })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        });
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            information: err // Send response with status 400 and information
        });
    })
}