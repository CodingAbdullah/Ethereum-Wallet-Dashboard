// Top Losing Coins Data Type
export default interface TopLosingCoinsType {
    id: string
    name: string,
    symbol: string,
    image: string,
    usd: number,
    market_cap_rank: number,
    usd_24h_change: number
}