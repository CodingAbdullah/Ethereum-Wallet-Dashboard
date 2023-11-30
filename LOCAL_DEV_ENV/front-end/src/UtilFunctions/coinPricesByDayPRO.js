import axios from 'axios';
    
export const coinPricesByDayPro = async ({ queryKey }) => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/coin-prices-by-day'
    
    let options = {
        method: "POST",
        body: JSON.stringify({ days : queryKey[2], coin: queryKey[1] }),
        headers: {
            'content-type' : 'application/json'
        }
    }

    // let QUERY_STRING_PRICES = `?vs_currency=usd&days=${queryKey[2]}`; // Default selection for now.
    // let PRICE_ENDPOINT = "/coins/" + queryKey[1] + "/market_chart" + QUERY_STRING_PRICES + "&interval=daily";
    // let coinPricesByInterval = {};

    let response = await axios.post(URL + API_ENDPOINT, options); // Fetch coin prices by interval

    // If response throws error, throw Error message.
    // If not, return data
    if (response.status !== 200) {
        throw new Error("Could not make coin prices by interval request");
    }
    else {
        return response.data.coinPricesByDay;
    }
}