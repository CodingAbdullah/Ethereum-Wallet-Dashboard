// Rocket Pool Stats Data Type
export default interface RocketPoolStatsType {
    information: {
        status: string,
        data: {
            current_node_fee: number,
            minipool_count: number,
            node_count: number,
            odao_member_count: number,
            reth_apr: number,
            reth_exchange_rate: number,
            reth_supply: number,
            rpl_price: number,
            total_eth_balance: number,
            total_eth_staking: number
        }
    }
}