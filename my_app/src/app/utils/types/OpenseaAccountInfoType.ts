// Opensea Account Information Data Type
export default interface OpenseaAccountInfoType {
    username: string,
    website: string,
    social_media_accounts: [
        { platform: string, username: string }
    ],
    bio: string,
    joined_date: string
}