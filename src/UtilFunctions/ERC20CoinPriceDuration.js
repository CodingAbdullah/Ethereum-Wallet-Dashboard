import axios from 'axios';
import moment from 'moment';

export const ERC20CoinPriceDuration = async ({ querykey }) => {
    // If empty, return nothing
    if (querykey[1] === ''){
        return;
    }
    else {
        // Request ERC20 token prices
        const URL= "https://api.coingecko.com/api/v3";
        const ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + querykey[1] + '/market_chart?vs_currency=usd&days=0.05';
        let coinPricesByInterval = {};

        let response = await axios.get(URL + ERC20_PRICE_ENDPOINT); // Fetch ERC20 token prices by interval

        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            let days = [];
            for (var i = 1; i < 16; i++){
                // Fetch the x number to determine interval. If 24, it is set to hourly and if 14 or 30, it is daily
                days.push(moment().subtract(i, 'days').calendar());
            }

            // Set the coin prices by interval object
            coinPricesByInterval.time = days.reverse();
            coinPricesByInterval.coinData = response.data;
        }

        return coinPricesByInterval;
    }
}