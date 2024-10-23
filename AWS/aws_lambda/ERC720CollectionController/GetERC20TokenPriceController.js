const axios = require('axios');

const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2'; // Base URL for Moralis API
const erc20Endpoint = '/erc20/'; // ERC20 endpoint

exports.handler = async (event) => {
    try {
        const { address } = JSON.parse(event.body); // Get address for request to Moralis

        // Pass in API key for backend request
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': process.env.MORALIS_API_KEY
            }
        };

        // Retrieve token price
        const response = await axios.get(`${MORALIS_URL}${erc20Endpoint}${address}/price`, options);

        return {
            statusCode: 200,
            body: JSON.stringify({
                information: response.data
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error fetching token price:', error);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ message: 'An error occurred' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
