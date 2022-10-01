/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
exports.NETWORK_MAPPER = {
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
    'moralis_url' : 'https://deep-index.moralis.io/api/v2/'
}