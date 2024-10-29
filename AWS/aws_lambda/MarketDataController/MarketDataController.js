const axios = require("axios");
const dayjs = require("dayjs");

// Pro CoinGecko API Endpoint
const PRO_COINGECKO_URL = "https://pro-api.coingecko.com/api/v3";

exports.handler = async (event) => {
    // Endpoint for fetching Global Cryptocurrency Market Cap data in the last 30 days
    const MARKET_DATA_ENDPOINT = "/global/market_cap_chart?days=30";
    
    // Pass in API key for backend request
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'x-cg-pro-api-key': process.env.COINGECKO_HOME_PAGE_API_KEY_3
        } 
    }

    try {
        // Pass in options containing API Key to make authenticated call to get market cap data
        const response = await axios.get(PRO_COINGECKO_URL + MARKET_DATA_ENDPOINT, options);
        let marketCapData = response.data.market_cap_chart.market_cap;               
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                capValues: marketCapData.map(cap => ({ 
                    time: dayjs(cap[0]).format('YYYY-MM-DD HH:mm:ss').split(" ")[0], 
                    price: Number(Number(cap[1])) 
                }))
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } 
    catch (error) {
        console.error('Error fetching market cap data:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}