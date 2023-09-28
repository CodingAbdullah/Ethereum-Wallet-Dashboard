import axios from 'axios';

export const walletTransactions = async ({ queryKey }) => {
    // Endpoints to be used
    const NODE_SERVER_URL = "https://18.221.208.44.nip.io";
    const TRANSACTION_HISTORY_ENDPOINT = '/address-transaction-history';

    // Configure options for making request to fetch wallet transaction history
    const options = {
        method: 'POST',
        body: JSON.stringify({ address : queryKey[1] }),
        headers: {
            'content-type': 'application/json'
        }
    }

    let response = await axios.post(NODE_SERVER_URL + TRANSACTION_HISTORY_ENDPOINT, options); // Fetch wallet txn history

    if (response.status !== 200){
        throw new Error("Could not fetch wallet transaction history");
    }
    
    return response.data.information;
};