import { getAddress, isAddress } from "viem";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE, shortHex, withTimeout } from "@/lib/og";
import { cachedAddress } from "@/lib/explorerCache";
import { lookupEnsName } from "@/lib/ens";
import { labelFor } from "@/lib/labels";

export const alt = 'Ethereum address';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Share image for /address/[address] (Ethereum mainnet)
export default async function Image({ params }: { params: Promise<{ address: string }> }) {
    const { address: raw } = await params;
    if (!isAddress(raw, { strict: false })) return ogImage({ eyebrow: 'Address', title: shortHex(raw) });
    const address = getAddress(raw);
    const [details, ens] = await Promise.all([withTimeout(cachedAddress('eth', address)), withTimeout(lookupEnsName(address))]);
    const label = labelFor(address)?.name ?? ens;
    return ogImage({
        eyebrow: `${details?.token ? 'Token contract' : details?.isContract ? 'Contract' : 'Wallet'} · Ethereum`,
        title: label ?? shortHex(address, 8),
        lines: [
            ...(label ? [shortHex(address, 8)] : []),
            ...(details ? [`${Number(details.balance).toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH · ${details.txCount.toLocaleString('en-US')} transactions sent`] : [])
        ]
    });
}
