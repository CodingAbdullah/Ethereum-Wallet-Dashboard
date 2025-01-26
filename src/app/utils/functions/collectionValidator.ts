// Custom function for validating a particular collection ID
export const collectionValidator = async (collection: string) => {

    // Using the free version of the CoinGecko API, verify if the collection ID is correct
    const response = await fetch('https://api.coingecko.com/api/v3/nfts/' + collection);

    // Conditionally return response
    if (response.ok) {
        const data = await response.json();
        return data.contract_address;
    }
    else {
        return "";
    }
}