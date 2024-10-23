const axios = require("axios");

// Blocknative API Endpoint
const BLK_URL = "https://api.blocknative.com/gasprices/blockprices";

exports.handler = async (event) => {
  // Configuring options  
    const options = {
      method: 'GET',
      headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'Authorization': process.env.BLK_API_KEY
      }
    };
    
    try {
        // Make the API request
        const response = await axios.get(BLK_URL, options);
        
        // Return successful response
        return {
            statusCode: 200,
            body: JSON.stringify({
                information: response.data
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } 
    catch (error) {
        // Log the error for debugging
        console.error('Error fetching gas data:', error);

        // Return error response
        return {
            statusCode: 400,
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};