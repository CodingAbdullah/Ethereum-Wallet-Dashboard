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

    if (network === 'eth' || network === 'sepolia' || network.split('-')[0] === 'polygon') {
        // Gather wallet analytics using API resources and running checks to see if wallet address is valid
        try {
            const response = await axios.get(NETWORK_MAPPER[network] + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + 
            ((network === 'polygon' || network === 'polygon-mumbai') ? process.env.POLYGON_API_KEY : process.env.ETHERSCAN_API_KEY));
            
            return {
                statusCode: 200,
                body: JSON.stringify({ information: response.data })
            };
        } 
        catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ information: err })
            };
        }
    } 
    else {
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'X-API-KEY': process.env.MORALIS_API_KEY
            }
        }
        
        // Transactions endpoint for retrieving information related to a wallet's activity on an ETH testnet
        try {
            const response = await axios.get(NETWORK_MAPPER.moralis_url + address + '/balance?chain=' + network, options);
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    information: { message: 'OK', result: response.data.balance }  
                })
            };
        } 
        catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ information: err })
            };
        }
    }
}