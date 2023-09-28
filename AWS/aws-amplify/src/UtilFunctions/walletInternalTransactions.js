import axios from 'axios';

export const walletInternalTransactions = async ({ queryKey }) => {
    // Endpoints to be used
    const NODE_SERVER_URL = "https://18.221.208.44.nip.io";
    const INTERNAL_TRANSACTION_HISTORY_ENDPOINT = '/address-internal-transaction-history';

    // Configure options for fetching internal wallet transaction history
    const options = {
        method: 'POST',
        body: JSON.stringify({ address : queryKey[1] }),
        headers: {
            'content-type': 'application/json'
        }
    };

    // Fetch internal wallet transaction history
    let response = await axios.post(NODE_SERVER_URL + INTERNAL_TRANSACTION_HISTORY_ENDPOINT, options);

    if (response.status !== 200){
        throw new Error("Could not fetch internal wallet transaction history");
    }

    return response.data.information;
}