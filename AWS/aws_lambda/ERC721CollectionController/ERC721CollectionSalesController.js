
require('dotenv').config({ path: '../.env' });
const axios = require('axios');

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
exports.NETWORK_MAPPER = {
    'eth': 'https://api.etherscan.io/api',
    'goerli': 'https://api-goerli.etherscan.io/api',
    'kovan': 'https://api-kovan.etherscan.io/api',
    'ropsten': 'https://api-ropsten.etherscan.io/api',
    'rinkeby': 'https://api-rinkeby.etherscan.io/api',
    'sepolia': 'https://api-sepolia.etherscan.io/api',
    'polygon': 'https://api.polygonscan.com/api',
    'polygon-mumbai': 'https://api-testnet.polygonscan.com/api',
    'alchemy_url': 'https://eth-mainnet.g.alchemy.com/nft/v2',
    'blocknative_url': 'https://api.blocknative.com/gasprices/blockprices',
    'moralis_url': 'https://deep-index.moralis.io/api/v2/',
    'opensea_url': 'https://api.opensea.io/api/v2/'
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
        const response = await axios.get(this.NETWORK_MAPPER.moralis_url + 'nft/' + address + TRADES_ENDPOINT, options);
        res.status(200).json({ information: response.data });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ error: 'Failed to fetch ERC721 collection sales' });
    }
};

// Export the handler for AWS Lambda
exports.handler = async (event, context) => {
    // Assuming the event contains the request and response structure
    return exports.getERC721CollectionSales(event, context);
};