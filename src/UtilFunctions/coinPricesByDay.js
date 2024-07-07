import axios from 'axios';
/*
import moment from 'moment';
    
// Check to see if the parameters exist and are valid, run to check prices, selection area for the different coins
const URL = "https://api.coingecko.com/api/v3";

export const coinPricesByDay = async ({ queryKey }) => {
    let QUERY_STRING_PRICES = `?vs_currency=usd&days=${queryKey[2]}`; // Default selection for now.
    let PRICE_ENDPOINT = "/coins/" + queryKey[1] + "/market_chart" + QUERY_STRING_PRICES + "&interval=daily";
    let coinPricesByInterval = {};

    let response = await axios.get(URL + PRICE_ENDPOINT); // Fetch coin prices by interval

    if (response.status !== 200) {
        throw new Error("Could not make coin prices by interval request");
    }
    else {
        let days = [];
        for (var i = 1; i < queryKey[2] + 1; i++){
            // Fetch the x number to determine interval. If 24, it is set to hourly and if 14 or 30, it is daily
            days.push(moment().subtract(i, 'days').calendar());
        }

        // Set the coin prices by interval object
        coinPricesByInterval.time = days.reverse();
        coinPricesByInterval.coinData = response.data;
    }

    return coinPricesByInterval;
}
*/