const axios = require("axios");

exports.handler = async (event) => { // Changed to AWS Lambda handler
    const { address, id, network } = JSON.parse(event.body); // Changed req.body to event.body

    if (network !== 'eth') {
        // Throw an alert on this message
        return { // Changed res.status(200).json to return
            statusCode: 200,
            body: JSON.stringify({
                information: { data: null } 
            })
        };
    } else {
        const options = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        };

        // Making request to Alchemy API for finding ERC721 token rarity
        try {
            const response = await axios.get('https://eth-mainnet.g.alchemy.com/nft/v2/' + process.env.ALCHEMY_API_KEY_1 + "/computeRarity?contractAddress=" + address + "&tokenId=" + id, options); // Use await for axios call
            return { // Changed res.status(200).json to return
                statusCode: 200,
                body: JSON.stringify({
                    information: { data: response.data }
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