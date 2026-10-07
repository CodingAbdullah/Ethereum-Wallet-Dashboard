// Liquid Staking Token Data Type
export default interface LiquidStakingType {
    protocol: string,
    token: string,
    eth_staked: number | null,
    exchange_rate: number | null,
    apr: number | null
}
