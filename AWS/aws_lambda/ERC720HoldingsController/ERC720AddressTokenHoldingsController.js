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

exports.handler = async (event) => { // Lambda entry point
    const { address, network } = JSON.parse(event.body); // Adjusted for Lambda event structure
    let refinedNetwork = (network === 'polygon-mumbai' ? 'mumbai' : network);

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    try {
        const response = await axios.get(NETWORK_MAPPER.moralis_url + address + '/erc20?chain=' + refinedNetwork, options); // Pass in address and chain values
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