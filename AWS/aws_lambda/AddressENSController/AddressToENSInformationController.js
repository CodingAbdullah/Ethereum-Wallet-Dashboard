const axios = require('axios');

exports.handler = async (event) => {
    try {
        // Parse the input from the Lambda event
        const { address } = JSON.parse(event.body);

        const options = {   
            method: 'GET', 
            headers: { 
                'content-type': 'application/json', 
                'X-API-KEY': process.env.MORALIS_API_KEY
            }
        };

        const response = await axios.get('https://deep-index.moralis.io/api/v2/resolve/' + address + "/reverse", options);

        return {
            statusCode: 200,
            body: JSON.stringify({
                information: response.data
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 400,
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};