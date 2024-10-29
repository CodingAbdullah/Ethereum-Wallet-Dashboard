const axios = require('axios');

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
const NETWORK_MAPPER = {
    'moralis_url' : 'https://deep-index.moralis.io/api/v2/',
}

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
    axios.get(NETWORK_MAPPER.moralis_url + 'nft/' + address, options)
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

        exports.getERC721CollectionData(req, res)
            .catch(err => reject(err));
    });
};