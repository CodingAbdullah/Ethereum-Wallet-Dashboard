require('dotenv').config({ path: '../.env'});
const MORALIS_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.moralis_url;
const ALCHEMY_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.alchemy_url;
const sdk = require('api')('@alchemy-docs/v1.0#3yq3i17l9sqr4d6'); // SDK ID for Alchemy package found through docs
const axios = require('axios');
const dayjs = require('dayjs');

const PRO_COINGECKO_URL = 'https://pro-api.coingecko.com/api/v3/';

exports.getERC721CollectionData = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-api-key' : process.env.MORALIS_API_KEY_2
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getERC721CollectionExtraData = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json', 
            'x-cg-pro-api-key' : process.env.COINGECKO_GENERIC_API_KEY
        }
    };

    // Run backend request
    axios.get(PRO_COINGECKO_URL + 'nfts/ethereum/contract/' + address, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(() => {
        res.status(400).json({});
    });
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

exports.getERC721CollectionTransfers = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    const TRANSFERS_ENDPOINT = '/transfers';

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY_2
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address + TRANSFERS_ENDPOINT, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getERC721CollectionSales = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    const TRADES_ENDPOINT = '/trades';

    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'x-api-key' : process.env.MORALIS_API_KEY_2
        }
    };

    // Run backend request
    axios.get(MORALIS_URL + 'nft/' + address + TRADES_ENDPOINT, options)
    .then(response => res.status(200).json({ information: response.data }))
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getERC721CollectionFloorPrice = (req, res) => {
    const { address } = JSON.parse(req.body.body);
    
    // Run backend request
    sdk.server(ALCHEMY_URL);

    sdk.getFloorPrice({ apiKey: process.ALCHEMY_API_KEY_1 , contractAddress: address })
    .then(response => res.status(200).json({ information: response }))
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getERC721CollectionAttributes = (req, res) => {
    const { address } = JSON.parse(req.body.body);

    // Run backend request
    sdk.server(ALCHEMY_URL);
    
    sdk.summarizeNFTAttributes({ contractAddress: address, apiKey: process.env.ALCHEMY_API_KEY_2 })
    .then(response => { res.status(200).json({ information: response })})
    .catch(() => {
        res.status(400).json({});
    });
}

exports.getERC721TopCollections = (req, res) => {

    // Setting options to fetch top collections
    const options = {
        method: 'GET',
        headers: {
            'content-type' : 'application/json',
            'X-API-Key' : process.env.MORALIS_API_KEY_2
        }
    };

    axios.get("https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections", options)
    .then(response => {
        res.status(200).json({
            topCollections: response.data
        });
    })
    .catch(() => {
        res.status(400).json({});
    });
}