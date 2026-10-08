import { isHash } from "viem";
import { ogImage, OG_CONTENT_TYPE, OG_SIZE, shortHex, withTimeout } from "@/lib/og";
import { cachedTx } from "@/lib/explorerCache";
import { labelFor } from "@/lib/labels";

export const alt = 'Ethereum transaction';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Share image for /tx/[hash] (Ethereum mainnet; share images can't see the ?chain= parameter)
export default async function Image({ params }: { params: Promise<{ hash: string }> }) {
    const { hash } = await params;
    const tx = isHash(hash) ? await withTimeout(cachedTx('eth', hash)) : null;
    if (!tx) return ogImage({ eyebrow: 'Transaction', title: shortHex(hash, 10) });
    const name = (a: string | null) => a ? labelFor(a)?.name ?? shortHex(a, 4) : 'contract creation';
    const tokenMoves = tx.logs.filter(l => l.amount !== undefined || l.tokenId !== undefined).length;
    return ogImage({
        eyebrow: 'Transaction · Ethereum',
        title: shortHex(tx.hash, 10),
        badge: { text: tx.status === 'success' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Pending', tone: tx.status === 'success' ? 'good' : tx.status === 'failed' ? 'bad' : 'neutral' },
        lines: [
            `${name(tx.from)} → ${name(tx.to)}`,
            `${Number(tx.valueEth).toLocaleString('en-US', { maximumFractionDigits: 6 })} ETH${tokenMoves ? ` · ${tokenMoves} token transfer${tokenMoves === 1 ? '' : 's'}` : ''}`,
            tx.blockNumber ? `Block ${tx.blockNumber.toLocaleString('en-US')}${tx.feeEth ? ` · fee ${Number(tx.feeEth).toFixed(6)} ETH` : ''}` : 'Not mined yet'
        ]
    });
}
