import axios from 'axios';

export const ensOwnershipPro = async ({ queryKey }) => {
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
        // Request ENS Ownership Information
        const NODE_SERVER_ADDRESS = "https://18.221.208.44.nip.io/"; // Our node server from the backend
        const ADDITIONAL_INFORMATION_ENDPOINT = 'ens-ownership-information'; // Personal Node server endpoint
    
        let options = {
            method: "POST",
            body: JSON.stringify({ walletAddress: queryKey[1] }),
            headers: {
                'content-type' : 'application/json'
            }
        }

        let response = await axios.post(NODE_SERVER_ADDRESS + ADDITIONAL_INFORMATION_ENDPOINT, options); // Fetch ERC20 token prices by interval

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