
require('dotenv').config({ path: '../.env' });
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs

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

exports.getERC721CollectionFloorPrice = async (req, res) => {
    try {
        const { address } = JSON.parse(req.body.body);
        
        // Run backend request
        sdk.server(this.NETWORK_MAPPER.alchemy_url);

        const response = await sdk.getFloorPrice({ apiKey: process.env.ALCHEMY_API_KEY_1, contractAddress: address });
        res.status(200).json({ information: response });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ error: 'Failed to fetch floor price' });
    }
};

// Export the handler for AWS Lambda
exports.handler = async (event, context) => {
    // Assuming the event contains the request and response structure
    return exports.getERC721CollectionFloorPrice(event, context);
};