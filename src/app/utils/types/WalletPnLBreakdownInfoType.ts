// Wallet PnL Breakdown Info Type
export default interface WalletPnLBreakdownInfoType {
    result : [
        {
            token_address: string,
            total_usd_invested: string,
            total_sold_usd: string,
            count_of_trades: number,
            realized_profit_usd: string,
            name: string,
            symbol: string,
            logo: string
        }
    ]
}