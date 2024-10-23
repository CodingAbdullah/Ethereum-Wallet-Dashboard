const axios = require('axios');

exports.handler = async (event) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-KEY': process.env.MORALIS_API_KEY
        }
    };

    try {
        const response = await axios.get('https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-tokens', options);
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
        console.error('Error fetching top ERC20 tokens:', error);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ message: 'An error occurred' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
