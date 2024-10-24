const axios = require("axios");

exports.handler = async (event) => { // Changed to AWS Lambda handler
    const { address, network } = JSON.parse(event.body); // Changed req.body to event.body

    let refinedNetwork = network === 'polygon-mumbai' ? 'mumbai' : network; // Filter network based on name and remove hashes

    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept' : 'application/json',
            'X-API-KEY' : process.env.MORALIS_API_KEY
        } 
    }

    try {
        const response = await axios.get('https://deep-index.moralis.io/api/v2/' + address + '/nft/transfers?chain=' + refinedNetwork + '&format=decimal&direction=both', options); // Use await for axios call
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