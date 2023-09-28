import axios from 'axios';

export const ERC20CoinInfo = async ({ queryKey }) => {
    // If empty, return nothing
    if (queryKey[1] === ''){
        return;
    }
    else {
        // Request ERC20 token information
        const URL= "https://api.coingecko.com/api/v3";
        const ERC20_INFO_ENDPOINT = '/coins/ethereum/contract/' + queryKey[1];

        let response = await axios.get(URL + ERC20_INFO_ENDPOINT); // Fetch ERC20 token prices by interval

        // If error is found, throw it
        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            // Return successful ERC20 token information
            return response.data;
        }
    }
}
