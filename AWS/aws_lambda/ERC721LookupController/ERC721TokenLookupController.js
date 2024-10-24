const axios = require("axios");

exports.handler = async (event) => { // Changed to AWS Lambda handler
    const { address, id, network } = JSON.parse(event.body); // Changed req.body to event.body

    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    // Making request to Moralis API for finding ERC721 token information
    try {
        const response = await axios.get('https://deep-index.moralis.io/api/v2/nft/' + address + "/" + id + "?chain=" + network + "&format=decimal", options); // Use await for axios call
        return { // Changed res.status(200).json to return
            statusCode: 200,
            body: JSON.stringify({ information: response.data })
        };
    } 
    catch (error) {
        return { // Changed res.status(400).json to return
            statusCode: 400,
            body: JSON.stringify({})
        };
    }
}