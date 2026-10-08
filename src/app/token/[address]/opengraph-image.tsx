import { getAddress, isAddress } from "viem";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE, shortHex, withTimeout } from "@/lib/og";
import { cachedToken } from "@/lib/explorerCache";

export const alt = 'Ethereum token';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Share image for /token/[address] (Ethereum mainnet)
export default async function Image({ params }: { params: Promise<{ address: string }> }) {
    const { address: raw } = await params;
    if (!isAddress(raw, { strict: false })) return ogImage({ eyebrow: 'Token', title: shortHex(raw) });
    const address = getAddress(raw);
    const token = await withTimeout(cachedToken('eth', address));
    if (!token) return ogImage({ eyebrow: 'Token · Ethereum', title: shortHex(address, 8) });
    return ogImage({
        eyebrow: 'Token · Ethereum',
        title: `${token.name ?? token.symbol ?? 'Token'}${token.symbol ? ` (${token.symbol})` : ''}`,
        lines: [
            shortHex(address, 8),
            ...(token.totalSupply ? [`Supply: ${Number(token.totalSupply).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${token.symbol ?? ''}`] : [])
        ]
    });
}
