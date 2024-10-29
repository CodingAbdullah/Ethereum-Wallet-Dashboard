const axios = require('axios');

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
const NETWORK_MAPPER = {
    'moralis_url': 'https://deep-index.moralis.io/api/v2/'
};

exports.getERC721CollectionSales = async (req, res) => {
    try {
        const { address } = JSON.parse(req.body.body);
        const TRADES_ENDPOINT = '/trades';

        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'x-api-key': process.env.MORALIS_API_KEY_2
            }
        };

        // Run backend request
        const response = await axios.get(NETWORK_MAPPER.moralis_url + 'nft/' + address + TRADES_ENDPOINT, options);
        res.status(200).json({ information: response.data });
    } 
    catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ error: 'Failed to fetch ERC721 collection sales' });
    }
};

// Export the handler for AWS Lambda
exports.handler = async (event, context) => {
    // Assuming the event contains the request and response structure
    return exports.getERC721CollectionSales(event, context);
};