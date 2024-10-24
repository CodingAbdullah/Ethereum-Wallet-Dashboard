const axios = require("axios");

exports.handler = async (event) => { // Changed to AWS Lambda handler
    const { address, id, network } = JSON.parse(event.body); // Changed req.body to event.body

    // If the holesky testnet is requested, return response with no information
    if (network === 'holesky') {
        return { // Changed res.status(200).json to return
            statusCode: 200,
            body: JSON.stringify({
                information: []
            })
        };
    } else {
        // Setting options to make authenticated API calls to retrieve ERC721 token information
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'accept' : 'application/json',
                'X-API-KEY' : process.env.OPENSEA_API_KEY
            }
        };

        // Making request to Opensea API to retrieve ERC721 token information
        try {
            const response = await axios.get('https://api.opensea.io/api/v2/chain/' + (network === 'eth' ? 'ethereum' : network) +  "/contract/" + address + '/nfts/' + id, options); // Use await for axios call
            return { // Changed res.status(200).json to return
                statusCode: 200,
                body: JSON.stringify({
                    information: [response.data]
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
}