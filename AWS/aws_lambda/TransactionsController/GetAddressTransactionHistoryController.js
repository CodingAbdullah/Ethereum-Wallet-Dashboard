const axios = require('axios');

const mod = "account";
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file
const startBlock = 0;
const endBlock = 99999999;
const page = 1;
const sort = 'desc';

exports.handler = async (event) => {
    const { address } = JSON.parse(event.body); // Changed req to event

    // Gather list of transactions in descending order
    try {
        const response = await axios.get('https://api.etherscan.io/api' + '?module=' + mod + "&action=txlist&address=" + address + "&startblock=" + startBlock 
        + '&endblock=' + endBlock + "&page=" + page + "&offset=" + 1000 + "&sort=" + sort + "&apikey=" + API_KEY);
        
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

