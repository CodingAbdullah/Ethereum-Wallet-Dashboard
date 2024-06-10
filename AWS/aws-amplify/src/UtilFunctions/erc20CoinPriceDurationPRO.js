import axios from 'axios';

export const erc20CoinPriceDurationPro = async ({ queryKey }) => {
    // If empty, return nothing
    if (queryKey === undefined){
        return [];
    }
    else if (queryKey[1] === undefined){
        return [];
    }
    else if (queryKey[1] === ''){
        return [];
    }
    else {
        // Request ERC20 token prices
        const URL = "http://localhost:5000";
        const ERC20_PRICE_DURATION_ENDPOINT = '/ERC20-coin-price-duration';
        // const ERC20_PRICE_ENDPOINT = '/coins/ethereum/contract/' + queryKey[1] + '/market_chart?vs_currency=usd&days=0.05';
    
        let options = {
            method: "POST",
            body: JSON.stringify({ contract: queryKey[1] }),
            headers: {
                'content-type' : 'application/json'
            }
        }
        
        // Make call to the backend fetching ERC20 price duration data
        let response = await axios.post(URL + ERC20_PRICE_DURATION_ENDPOINT, options); // Fetch ERC20 token prices by interval

        // If not successful, throw Error
        // If not, return coin data
        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            return response.data.ERC20PriceDurationData;
        }
    }
}