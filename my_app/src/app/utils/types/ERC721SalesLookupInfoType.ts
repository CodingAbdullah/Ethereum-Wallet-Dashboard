// Custom ERC721 Sales Lookup Info Data Type
export default interface ERC721SalesLookupInfoType {
    timestamp: string,
    exchange_name: string,
    contract_version: string,
    eth_price: number,
    usd_price: number,
    buyer: string,
    seller: string
}