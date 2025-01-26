// ENS Resolver Custom Data Type
export default interface ENSResolverType {
    ens_name: string,
    registration_timestamp: string,
    expiration_timestamp: string,
    last_refreshed: string,
    grace_period_ends: string,
    premium_period_ends: string,
    in_grace_period: boolean,
    in_premium_period: boolean,
    is_expired: boolean
}