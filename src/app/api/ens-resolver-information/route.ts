import { NextResponse } from "next/server";

const ENS_CONTRACT = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';
const MORALIS_URL = 'https://deep-index.moralis.io/api/v2.2/';

const DAY_MS = 24 * 60 * 60 * 1000;

function getAttr(attributes: any[], traitType: string): string | undefined {
    return attributes?.find((a: any) => a.trait_type === traitType)?.value;
}

function toISOOrEmpty(unixSeconds: string | number | undefined): string {
    if (!unixSeconds) return '';
    const n = Number(unixSeconds);
    if (isNaN(n)) return '';
    // Moralis may return ms instead of seconds; values > 1e11 are already ms
    const ms = n > 1e11 ? n : n * 1000;
    return new Date(ms).toISOString();
}

const moralisHeaders = {
    'content-type': 'application/json',
    'accept': 'application/json',
    'X-API-KEY': process.env.MORALIS_API_KEY ?? ''
} as HeadersInit;

async function resolveToAddress(input: string): Promise<string | null> {
    if (input.startsWith('0x')) return input;
    const res = await fetch(MORALIS_URL + 'resolve/ens/' + encodeURIComponent(input), { headers: moralisHeaders });
    if (!res.ok) return null;
    const json = await res.json();
    return json.address ?? null;
}

// Custom Route Handler function
export async function POST(request: Request) {
    const body = await request.json();

    const resolvedAddress = await resolveToAddress(body.address);
    if (!resolvedAddress)
        return NextResponse.json({ error: 'Could not resolve ENS name to an address' }, { status: 400 });

    // Fetch ENS NFTs owned by this address — for most wallets owner and resolved address are the same
    const url = MORALIS_URL + encodeURIComponent(resolvedAddress)
        + '/nft?chain=eth&format=decimal&normalizeMetadata=true'
        + '&token_addresses%5B0%5D=' + ENS_CONTRACT;

    const response = await fetch(url, { method: 'GET', headers: moralisHeaders });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        return NextResponse.json({ error: 'Moralis NFT error', status: response.status, detail: errorBody }, { status: response.status });
    }

    const data = await response.json();
    const now = Date.now();

    const results = (data.result ?? []).map((token: any) => {
        const attrs = token.normalized_metadata?.attributes ?? [];
        const expiryUnix = getAttr(attrs, 'Expiration Date');
        const createdUnix = getAttr(attrs, 'Created Date') ?? getAttr(attrs, 'Registration Date');
        const lastRefreshed = token.last_metadata_sync ?? '';

        const expiryRaw = expiryUnix ? Number(expiryUnix) : null;
        const expiryMs = expiryRaw ? (expiryRaw > 1e11 ? expiryRaw : expiryRaw * 1000) : null;
        const gracePeriodEndsMs = expiryMs ? expiryMs + 90 * DAY_MS : null;
        const premiumPeriodEndsMs = gracePeriodEndsMs ? gracePeriodEndsMs + 28 * DAY_MS : null;

        return {
            ens_name: token.normalized_metadata?.name ?? token.name ?? '',
            registration_timestamp: toISOOrEmpty(createdUnix),
            expiration_timestamp: toISOOrEmpty(expiryUnix),
            grace_period_ends: gracePeriodEndsMs ? new Date(gracePeriodEndsMs).toISOString() : '',
            premium_period_ends: premiumPeriodEndsMs ? new Date(premiumPeriodEndsMs).toISOString() : '',
            in_grace_period: expiryMs ? now > expiryMs && gracePeriodEndsMs !== null && now < gracePeriodEndsMs : false,
            in_premium_period: gracePeriodEndsMs ? now > gracePeriodEndsMs && premiumPeriodEndsMs !== null && now < premiumPeriodEndsMs : false,
            is_expired: premiumPeriodEndsMs ? now > premiumPeriodEndsMs : false,
            last_refreshed: lastRefreshed
        };
    });

    return NextResponse.json({ results });
}
