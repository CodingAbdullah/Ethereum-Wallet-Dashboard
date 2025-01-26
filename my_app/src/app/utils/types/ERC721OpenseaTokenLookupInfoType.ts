// Custom ERC721 Opensea Token Lookup Data Type
export default interface ERC721OpenseaTokenLookupInfoType {
    name: string,
    token_standard: string,
    image_url: string,
    is_suspicious: boolean,
    owners: Array<{address: string, quantity: number}>,
    rarity: {
        rank: number
    },
    updated_at: string,
    creator: string
}