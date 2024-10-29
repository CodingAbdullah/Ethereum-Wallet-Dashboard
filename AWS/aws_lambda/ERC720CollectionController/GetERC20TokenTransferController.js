const axios = require('axios');

exports.handler = async (event) => {
    try {
        const { contract } = JSON.parse(event.body); // Get contract address for request to Moralis

        // Pass in API key for backend request
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': process.env.MORALIS_API_KEY_2
            }
        };

        // Retrieve token transfers
        const response = await axios.get(`https://deep-index.moralis.io/api/v2.2/erc20/${contract}/transfers`, options);

        return {
            statusCode: 200,
            body: JSON.stringify({
                information: response.data
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } 
    catch (error) {
        console.error('Error fetching token transfers:', error);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ message: 'An error occurred' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};