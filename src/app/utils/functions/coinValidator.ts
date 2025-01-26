import CoinChartInfoType from "../types/CoinChartInfoType";

// Custom function for validating a particular coin ID
export const coinValidator = async (coin: string) => {

    // Using the free version of the CoinGecko API, verify if the coin ID is correct
    const response = await fetch('https://api.coingecko.com/api/v3/coins/' + coin);

    // Conditionally return response
    if (response.ok) {
        const data: CoinChartInfoType = await response.json();
        return data;
    }
    else {
        return {} as CoinChartInfoType;
    }
}