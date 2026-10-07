// Rocket Pool Stats Data Type
export default interface RocketPoolStatsType {
    information: {
        status: string,
        data: {
            current_node_fee: number | null,
            minipool_count: number | null,
            node_count: number | null,
            reth_apr: number | null,
            reth_exchange_rate: number | null,
            reth_supply: number | null,
            rpl_price: number | null,
            total_eth_balance: number | null,
            total_eth_staking: number | null
        }
    }
}