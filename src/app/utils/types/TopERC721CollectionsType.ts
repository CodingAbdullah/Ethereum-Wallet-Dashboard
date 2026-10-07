// Top ERC721 Collections Data Type (OpenSea collection stats)
export default interface TopERC721CollectionsType {
    slug: string,
    collection_title: string,
    collection_image: string,
    floor_price: number,
    floor_price_symbol: string,
    volume_24h: number,
    volume_24h_percent_change: number,
    volume_7d: number,
    owners: number
}
