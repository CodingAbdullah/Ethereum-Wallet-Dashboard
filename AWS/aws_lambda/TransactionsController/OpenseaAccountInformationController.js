const axios = require('axios');

exports.handler = async (event) => {
    const { address } = JSON.parse(event.body); // Changed req to event

    // Set options for making authenticated API calls
    let options = {
        method: 'GET',
        headers: { // Removed 'mode' as it's not applicable in Node.js
            'content-type': 'application/json',
            'accept': 'application/json',
            'X-API-KEY': process.env.OPENSEA_API_KEY
        }
    }
    
    // Gather data about Opensea account
    try {
        const response = await axios.get('https://api.opensea.io/api/v2/accounts/' + address, options);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ information: response.data })
        };
    } 
    catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({})
        };
    }
}