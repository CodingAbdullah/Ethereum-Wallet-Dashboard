import axios from 'axios';

// Function for fetching top/bottom coin prices using a custom back-end API
export const ERC721TopCollections = async () => {
    const URL = 'http://localhost:5000';
    const API_ENDPOINT = '/erc-721-top-trending-collections';

    // Fetching coin data from the custom back-end API
    let response = await axios.get(URL + API_ENDPOINT);

    if (response.status === 200) {
        return response.data.topCollections;
    }
    else {
        throw new Error("Could not fetch coin data");
    }
}   