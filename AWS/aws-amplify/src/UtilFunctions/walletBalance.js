import axios from 'axios';

export const walletBalance = async ({ queryKey }) => {
    const NODE_SERVER_URL = "https://18.221.208.44.nip.io";
    const TRANSACTION_BALANCE_ENDPOINT = '/address-transaction-amount';
    
    // Configure options for wallet balance data fetching
    const options = {
        method: 'POST',
        body: JSON.stringify({ address : queryKey[1] }),
        headers: {
            'content-type': 'application/json'
        }
    };

    let response = await axios.post(NODE_SERVER_URL + TRANSACTION_BALANCE_ENDPOINT, options); // Fetch wallet balance
   
    // Throw error if request did not succeed
    if (response.status !== 200){
        throw new Error("Could not fetch wallet balance");
    }
    
    return response.data.information;
}