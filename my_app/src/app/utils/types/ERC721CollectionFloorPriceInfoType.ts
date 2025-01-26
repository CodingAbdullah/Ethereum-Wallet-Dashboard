// ERC721 Collection Floor Price Info Type
export default interface ERC721CollectionFloorPriceInfoType {
    [key: string] : {
        floorPrice: number,
        priceCurrency: string,
        collectionUrl: string,
        retrievedAt: string
    }
}