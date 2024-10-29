const axios = require('axios');

exports.handler = async (event) => {
    try {
        // Parse the input from the Lambda event
        const { id } = JSON.parse(event.body);

        const params = {
            chain_id: 'ethereum',
            token_id: id
        };

        const options = {
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
                'X-API-KEY': process.env.TRANSPOSE_API_KEY_1
            } 
        };

        const response = await axios.get(
            'https://api.transpose.io/ens/ens-transfers-by-token-id?' + new URLSearchParams(params),
            options
        );

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