
require('dotenv').config({ path: '../.env' });
const axios = require('axios');

// Data to fetch top ERC721 collections
exports.getERC721TopCollections = async (req, res) => {
    try {
        // Setting options to fetch top collections
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY_2
            }
        };

        const response = await axios.get("https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections", options);
        res.status(200).json({
            topCollections: response.data
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).json({ error: 'Failed to fetch top ERC721 collections' });
    }
};

// Export the handler for AWS Lambda
exports.handler = async (event, context) => {
    // Assuming the event contains the request and response structure
    return exports.getERC721TopCollections(event, context);
};