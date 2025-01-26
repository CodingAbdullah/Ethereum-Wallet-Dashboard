// ERC721 Collection Extra Data Type
export default interface ERC721CollectionExtraDataType {
    contract_address: string
    image: {
        small: string
    },
    market_cap: {
        usd: number
    },
    market_cap_24h_percentage_change : {
        usd: number
    },
    volume_24h: {
        usd: number
    },
    volume_24h_percentage_change: {
        usd: number
    },
    floor_price : {
        usd: number
    },
    floor_price_24h_percentage_change: {
        usd: number
    },
    floor_price_7d_percentage_change: {
        usd: number
    },
    floor_price_14d_percentage_change : {
        usd: number
    },
    floor_price_30d_percentage_change: {
        usd: number
    },
    floor_price_60d_percentage_change : {
        usd: number
    },
    number_unique_address: number,
    total_supply: number,
    one_day_sales: number,
    one_day_average_sale_price: number
}