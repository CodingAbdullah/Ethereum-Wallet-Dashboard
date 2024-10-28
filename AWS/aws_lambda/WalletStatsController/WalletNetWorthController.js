const axios = require('axios');

// Endpoint for fetching the net worth of a wallet
exports.handler = async (event) => {
    const { address, network } = JSON.parse(event.body); // Changed req to event

    if (network !== 'eth') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                information: { result: [] }
            })
        };
    } 
    else {
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'X-API-KEY': process.env.MORALIS_API_KEY_2
            }
        }

        // Retrieving information related to a wallet's net worth on ETH mainnet
        try {
            const response = await axios.get("https://deep-index.moralis.io/api/v2.2/wallets/" + address 
                + "/net-worth?chains%5B0%5D=eth&exclude_spam=true&exclude_unverified_contracts=true", options);
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    walletNetWorth: response.data
                })
            };
        } 
        catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({})
            };
        }
    }
}