const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface MoralisTransfer {
    block_timestamp: string;
    from_address?: string;
    to_address?: string;
}

// Simplified transfer rows used by the ENS transfer tables
export function toTransferRows(transfers: MoralisTransfer[] = []) {
    return transfers.map(transfer => ({
        timestamp: transfer.block_timestamp,
        category: !transfer.from_address || transfer.from_address === ZERO_ADDRESS ? 'mint' : 'transfer',
        from: transfer.from_address ?? null,
        to: transfer.to_address ?? null
    }));
}
