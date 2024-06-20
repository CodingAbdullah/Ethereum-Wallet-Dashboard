import axios from 'axios';

// Function for fetching specific Opensea account information
export const openseaAccountInformation = async ({ queryKey }) => {
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
        // Request Opensea account information
        const NODE_URL = "http://localhost:5000/";
        const OPENSEA_ACCOUNT_URL = 'opensea-account-information';
    
        // Setting options for API request
        const options = {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ address : queryKey[1] }),
            headers: {
                'content-type': 'application/json'
            }
        }

        let response = await axios.post(NODE_URL + OPENSEA_ACCOUNT_URL, options); // Setting options to fetch Opensea account informations

        // Throw error, if it is found
        if (response.status !== 200) {
            throw new Error("Could not make coin prices by interval request");
        }
        else {
            // Return successful Opensea account information
            return response.data.information;
        }
    }
}