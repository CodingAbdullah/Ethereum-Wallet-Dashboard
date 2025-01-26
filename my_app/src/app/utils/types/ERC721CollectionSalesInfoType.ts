// ERC721 Collection Sales Info Data Type
export default interface ERC721CollectionSalesInfoType {
    block_timestamp: string,
    token_ids: Array<string>,
    buyer_address: string,
    seller_address: string,
    price_formatted: string
}