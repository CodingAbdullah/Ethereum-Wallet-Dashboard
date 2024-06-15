import axios from 'axios';

// Function for fetching specific ERC721 Token Sales Information
export const erc721SalesPro = async ({ queryKey }) => {
    // If empty, return nothing
    if (queryKey === undefined){
        return [];
    }
    else if (queryKey[1] === undefined || queryKey[2] === undefined){
        return [];
    }
    else if (queryKey[1] === '' || queryKey[2] === ''){
        return [];
    }
    else {
        // Request ERC721 Sales Information
        const NODE_URL = "https://18.221.208.44.nip.io/";
        const ERC721_SALES_ENDPOINT = 'erc721-sales-by-id';
    
        // Upon render, run API call to collect data using information passed down from parent component, provided it is the mainnet
        const options = {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ address : queryKey[1], id: queryKey[2] }),
            headers: {
                'content-type': 'application/json'
            }
        }

        let response = await axios.post(NODE_URL + ERC721_SALES_ENDPOINT, options); // Fetch ERC20 token prices by interval

        // Throw error, if it is found
        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            // Return successful ERC20 token information
            return response.data.information;
        }
    }
}