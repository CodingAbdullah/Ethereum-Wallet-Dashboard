// Wallet PnL Info Type
export default interface WalletPnLInfoType {
    total_count_of_trades: number,
	total_trade_volume: string,
	total_realized_profit_usd: string,
	total_realized_profit_percentage: number,
	total_buys: number,
	total_sells: number,
	total_sold_volume_usd: string,
	total_bought_volume_usd: string
}