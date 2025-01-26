// ERC20 Token Information Section Data Type
export default interface ERC20TokenInformationSectionType {
    id: string,
    description: {
        en: string
    },
    image: {
        thumb: string
    },
    last_updated: string,
    name: string,
    links: { 
        homepage: Array<string>,
        chat_url: Array<string>,
        twitter_screen_name: string
    },
    symbol: string,
    market_data : {
        ath: {
            usd: number
        },
        ath_change_percentage: {
            usd: number
        },
        ath_date : {
            usd: string
        },
        atl: {
            usd: number
        },
        atl_change_percentage: {
            usd: number
        },
        atl_date : {
            usd: string
        },
        current_price: {
            usd: number
        },
        total_volume : {
            usd: number
        },
        high_24h: {
            usd: number
        },
        low_24h: {
            usd: number
        },
        circulating_supply: number,
        max_supply: number,
        price_change_24h: number,
        total_supply: number
    }
}