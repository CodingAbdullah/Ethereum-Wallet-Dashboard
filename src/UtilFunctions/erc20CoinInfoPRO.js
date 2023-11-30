import axios from 'axios';

export const erc20CoinInfoPro = async ({ queryKey }) => {
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
        // Request ERC20 token information
        const URL = 'http://localhost:5000';
        const ERC20_INFO_ENDPOINT = '/ERC20-coin-information';

        let options = {
            method: "POST",
            body: JSON.stringify({ contract: queryKey[1] }),
            headers: {
                'content-type' : 'application/json'
            }
        }

        // const URL = "https://api.coingecko.com/api/v3";
        // const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + queryKey[1];

        let response = await axios.post(URL + ERC20_INFO_ENDPOINT, options); // Fetch ERC20 token prices by interval

        // If error is found, throw it
        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            // Return successful ERC20 token information
            return response.data.ERC20CoinData;
        }
    }
}