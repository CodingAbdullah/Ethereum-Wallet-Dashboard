// Coin Chart Information Data Type
export default interface CoinChartInfoType {
    id: string,
    name: string,
    symbol: string,
    market_data : {
        current_price: {
            usd: number
        },
        price_change_percentage_24h: number
    }
}