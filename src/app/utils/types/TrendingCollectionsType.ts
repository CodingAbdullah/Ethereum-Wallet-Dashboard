// Trending Collections Data Type
export default interface TrendingCollectionsType {
    name: string,
    symbol: string,
    thumb: string,
    id: string,
    data : {
	    floor_price: string,
	    h24_volume: string,
	    floor_price_in_usd_24h_percentage_change: string
    }
}