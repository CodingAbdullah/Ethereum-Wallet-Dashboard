require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const dayjs = require('dayjs');

const PRO_COINGECKO_URL = 'https://pro-api.coingecko.com/api/v3/';

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
    'moralis_url' : 'https://deep-index.moralis.io/api/v2/',
    'opensea_url' : 'https://api.opensea.io/api/v2/'
}

exports.getERC721CollectionChartData = (req, res) => {
    const { address, interval } = JSON.parse(req.body.body);

    let modifiedInterval = interval === '14' ? 15 : interval;

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        }
    };

    // Run backend request to fetch ERC721 Collection Chart data
    axios.get(PRO_COINGECKO_URL + 'nfts/ethereum/contract/' + address + '/market_chart?days=' + modifiedInterval, options)
    .then(response => {
        // Get hold of floor price, market cap, and volume data of the collection
        // Modify each part of the data by including time and value
        let floor_price = response.data.floor_price_usd;
        let market_cap = response.data.market_cap_usd;
        let volume = response.data['h24_volume_usd'];

        res.status(200).json({
            floorPrices: floor_price.map(floorPriceValue => ({ 
                time: dayjs(floorPriceValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(floorPriceValue[1])) 
            })),
            marketCaps: market_cap.map(marketCapValue => ({ 
                time: dayjs(marketCapValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(marketCapValue[1])) 
            })),
            volumes: volume.map(volumeValue => ({ 
                time: dayjs(volumeValue[0]).format('YYYY-MM-DD'), 
                price: Number(Number(volumeValue[1])) 
            }))
        });
    })
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

        exports.getERC721CollectionChartData(req, res)
            .catch(err => reject(err));
    });
};