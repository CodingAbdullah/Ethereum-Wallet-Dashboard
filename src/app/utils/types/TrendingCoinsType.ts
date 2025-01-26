// Custom type for working with Trending Coins
export default interface TrendingCoinsType {
    item: {
        id: string,
        market_cap_rank: string,
        name: string,
        symbol: string,
        small: string
        data : {
            market_cap: string,
            price: number,
            price_change_percentage_24h : {
                usd: number
            }
        }
    }
}