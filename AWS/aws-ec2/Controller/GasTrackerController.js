require('dotenv').config({ path: '../.env' });
const BLK_URL = require('../Utils/NetworkMapper').NETWORK_MAPPER.blocknative_url;
const axios = require('axios');

// Controller function for fetching Ethereum gas information
exports.gasTrackInformation = (req, res) => {

    // Add blocknative credentials
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'Authorization' : process.env.BLK_API_KEY
        }
    }
    
    axios.get(BLK_URL, options)
    .then(response => {
        res.status(200).json({
            information: response.data
        });
    })
    .catch(err => {
        res.status(400).json({
            information: err
        });
    });
}