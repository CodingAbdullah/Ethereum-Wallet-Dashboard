const axios = require("axios");

exports.handler = async (event) => { // Changed to AWS Lambda handler
    const { address, id } = JSON.parse(event.body); // Changed req.body to event.body

    const params = {
        "chain_id": "ethereum",
        "contract_address": address,
        "token_id": id
    }
    
    const options = {
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.TRANSPOSE_API_KEY_1
        } 
    }

    // Making request to Transpose API for finding ERC721 token sales information
    try {
        const response = await axios.get("https://api.transpose.io/nft/sales-by-token-id?" + new URLSearchParams(params), options); // Use await for axios call
        return { // Changed res.status(200).json to return
            statusCode: 200,
            body: JSON.stringify({
                information: response.data
            })
        };
    } 
    catch (error) {
        return { // Changed res.status(400).json to return
            statusCode: 400,
            body: JSON.stringify({})
        };
    }
}