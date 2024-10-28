const axios = require('axios');

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
const NETWORK_MAPPER = {
    'eth' : 'https://api.etherscan.io/api',
    'goerli' : 'https://api-goerli.etherscan.io/api',  
    'kovan' : 'https://api-kovan.etherscan.io/api',
    'ropsten' : 'https://api-ropsten.etherscan.io/api',
    'rinkeby' : 'https://api-rinkeby.etherscan.io/api',
    'sepolia' : 'https://api-sepolia.etherscan.io/api',
    'polygon' :  'https://api.polygonscan.com/api',
    'polygon-mumbai' : 'https://api-testnet.polygonscan.com/api',
    'alchemy_url' : 'https://eth-mainnet.g.alchemy.com/nft/v2',    
    'blocknative_url' : 'https://api.blocknative.com/gasprices/blockprices',
    'moralis_url' : 'https://deep-index.moralis.io/api/v2/',
    'opensea_url' : 'https://api.opensea.io/api/v2/'
}

exports.handler = async (event) => {
    const { address, network } = JSON.parse(event.body); // Changed req to event

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network;
    const ERC20TOKEN_ENDPOINT = '/erc20?chain=' + refinedNetwork;

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'X-API-KEY': process.env.MORALIS_API_KEY
        }
    }

    // ERC20 endpoint for retrieving information related to holdings
    try {
        const response = await axios.get(NETWORK_MAPPER.moralis_url + address + ERC20TOKEN_ENDPOINT, options);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                information: response.data 
            })
        };
    } 
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({})
        };
    }
}