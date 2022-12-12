require('dotenv').config({ path: '../.env' });
// const sdk = require('api')('@transpose/v0#3xj19sl7j8jtul'); // Unique identifier for Transpose APIs found in docs
const axios = require('axios');

exports.ensTransfersByName = (req, res) => {
    const { ensName } = JSON.parse(req.body.body);

    const params = {
        chain_id : 'ethereum',
        ens_name: ensName
    }

    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } 
    }

    axios.get('https://api.transpose.io/ens/ens-transfers-by-name?' + new URLSearchParams(params), options)
    .then(response => {
        console.log(response);
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => {
        console.log(err);
    });

/*
    sdk.get('/ens-transfers-by-name?ens_name=' + ensName + '&transfer_category=all&order=asc', { 'x-api-key': process.env.TRANSPOSE_API_KEY_3 })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        })
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            information: err // Send response with status 400 and information
        })
    });
*/
}

exports.ensTransfersById = (req, res) => {
    const { id } = JSON.parse(req.body.body);

    const params = {
        chain_id : 'ethereum',
        token_id: id
    }

    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } 
    }

    axios.get('https://api.transpose.io/ens/ens-transfers-by-token-id?' + new URLSearchParams(params), options)
    .then(response => {
        console.log(response);
        res.status(200).json({
            information: response.data
        })
    })
    .catch(err => {
        console.log(err);
    });

    /*
    sdk.get('/ens-transfers-by-token-id?token_id=' + id + '&transfer_category=all&order=asc', { 'x-api-key': process.env.TRANSPOSE_API_KEY_2 })
    .then(response => {
        res.status(200).json({
            information: response // Send response with status 200 and information
        })
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            information: err // Send response with status 400 and information
        })
    });
    */
}