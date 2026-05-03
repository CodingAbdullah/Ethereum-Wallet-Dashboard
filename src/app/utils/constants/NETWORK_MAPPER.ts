import NetworkMapperType from "../types/NetworkMapperType";

/*  
    To be used to configure which blockchain network to access information
    ETH and their testnet Sepolia will be fetched using Etherscan
    Moralis will be used for the other testnets on Ethereum
    Polygonscan for their mainnet and their Mumbai testnet
*/
export const NETWORK_MAPPER: NetworkMapperType = {
    'eth' : 'https://api.etherscan.io/v2/api?chainid=1',
    'sepolia' : 'https://api.etherscan.io/v2/api?chainid=11155111',
    'alchemy_url' : 'https://eth-mainnet.g.alchemy.com/nft/v3',
    'blocknative_url' : 'https://api.blocknative.com/gasprices/blockprices',
    'moralis_url' : 'https://deep-index.moralis.io/api/v2.2/',
    'opensea_url' : 'https://api.opensea.io/api/v2/'
}