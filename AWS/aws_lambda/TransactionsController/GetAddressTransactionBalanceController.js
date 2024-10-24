const axios = require('axios');

const mod = "account";
const action = "balance";
const tag = "latest";
const API_KEY = process.env.ETHERSCAN_API_KEY; // Custom API KEY generated and hidden under .env file

exports.handler = async (event) => {
    const { address } = JSON.parse(event.body); // Changed req to event

    try {
        const response = await axios.get('https://api.etherscan.io/api' + "?module=" + mod + "&action=" + action + "&address=" + address + "&tag=" + tag + "&apikey=" + API_KEY);
        
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