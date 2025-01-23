// Wallet Balance Data Type
export default interface WalletBalanceInfoType {
    total_networth_usd: string,
    chains: [
        { 
            native_balance_usd: string
            native_balance_formatted: string,
            token_balance_usd: string
        }
    ]
}