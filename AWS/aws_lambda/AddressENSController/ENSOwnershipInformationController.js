const axios = require('axios');

exports.handler = async (event) => {
    try {
        // Parse the input from the Lambda event
        const { walletAddress } = JSON.parse(event.body);
        
        const params = {
            "chain_id": "ethereum",
            "owner_address": walletAddress,
        };
        
        const options = {
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
                'X-API-KEY': process.env.TRANSPOSE_API_KEY_2
            } 
        };

        const response = await axios.get(
            "https://api.transpose.io/ens/ens-records-by-owner?" + new URLSearchParams(params),
            options
        );

        console.log(response);

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
        console.error('Error:', error);

        return {
            statusCode: 400,
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};