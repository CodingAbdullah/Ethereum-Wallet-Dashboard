const axios = require('axios');

const PRO_COINGECKO_URL = 'https://pro-api.coingecko.com/api/v3/';

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
    .catch(() => {
        res.status(400).json({});
    });
}

// Lambda function handler
exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        const req = {
            body: JSON.stringify(event.body) // Assuming event.body contains the necessary data
        };
        const res = {
            status: (statusCode) => {
                return {
                    json: (data) => resolve({ statusCode, body: JSON.stringify(data) })
                };
            }
        };

        exports.getERC721CollectionExtraData(req, res)
            .catch(err => reject(err));
    });
};