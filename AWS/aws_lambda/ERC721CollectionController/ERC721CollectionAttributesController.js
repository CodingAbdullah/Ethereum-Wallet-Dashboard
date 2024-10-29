const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
const NETWORK_MAPPER = {
    'alchemy_url' : 'https://eth-mainnet.g.alchemy.com/nft/v2'
}

exports.getERC721CollectionAttributes = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Run backend request
    sdk.server(NETWORK_MAPPER.alchemy_url);
    
    sdk.summarizeNFTAttributes({ contractAddress: address, apiKey: process.env.ALCHEMY_API_KEY_2 })
    .then(response => { res.status(200).json({ information: response })})
    .catch(() => {
        res.status(400).json({});
    });
}

// Lambda function handler
exports.handler = async (event) => {
    // Call the existing function
    return await exports.getERC721CollectionAttributes(event);
};