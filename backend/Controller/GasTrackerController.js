require('dotenv').config({ path: '../.env' });
const axios = require('axios');

exports.gasTrackInformation = (req, res) => {
    // Add blocknative credentials
    const BLK_URL = 'https://api.blocknative.com/gasprices/blockprices';
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
        })
    })
    .catch(err => {
        res.status(400).json({
            information: err
        })
    })
}