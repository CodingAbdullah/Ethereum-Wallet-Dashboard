import { moralis } from "./providers/moralis";
import { ENS_BASE_REGISTRAR, toAddress } from "./ens";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_PERIOD_DAYS = 90;
const PREMIUM_PERIOD_DAYS = 21;

interface MoralisNft {
    name?: string;
    last_metadata_sync?: string;
    normalized_metadata?: {
        name?: string;
        attributes?: { trait_type: string; value: string | number }[];
    };
}

function attribute(token: MoralisNft, traitType: string) {
    return token.normalized_metadata?.attributes?.find(attr => attr.trait_type === traitType)?.value;
}

// ENS metadata stores dates as unix seconds or milliseconds
function toMs(value: string | number | undefined): number | null {
    if (value === undefined || value === '') return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n > 1e11 ? n : n * 1000;
}

const iso = (ms: number | null) => (ms ? new Date(ms).toISOString() : '');

// .eth names held by an address (or ENS name), with registration, expiry, grace and premium periods
export async function getEnsHoldings(input: string) {
    const address = await toAddress(input);
    if (!address) return null;

    const data = await moralis<{ result?: MoralisNft[] }>(
        '/' + address + '/nft?chain=eth&format=decimal&normalizeMetadata=true&token_addresses%5B0%5D=' + ENS_BASE_REGISTRAR
    );
    const now = Date.now();

    return (data.result ?? []).map(token => {
        const expiryMs = toMs(attribute(token, 'Expiration Date'));
        const createdMs = toMs(attribute(token, 'Created Date') ?? attribute(token, 'Registration Date'));
        const graceEndsMs = expiryMs ? expiryMs + GRACE_PERIOD_DAYS * DAY_MS : null;
        const premiumEndsMs = graceEndsMs ? graceEndsMs + PREMIUM_PERIOD_DAYS * DAY_MS : null;

        return {
            ens_name: token.normalized_metadata?.name ?? token.name ?? '',
            registration_timestamp: iso(createdMs),
            expiration_timestamp: iso(expiryMs),
            grace_period_ends: iso(graceEndsMs),
            premium_period_ends: iso(premiumEndsMs),
            in_grace_period: !!(expiryMs && graceEndsMs && now > expiryMs && now < graceEndsMs),
            in_premium_period: !!(graceEndsMs && premiumEndsMs && now > graceEndsMs && now < premiumEndsMs),
            is_expired: !!(premiumEndsMs && now > premiumEndsMs),
            last_refreshed: token.last_metadata_sync ?? ''
        };
    });
}
