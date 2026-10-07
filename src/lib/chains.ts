// Every network the dashboard supports, and what each free provider covers on it.
// Plain data only, so both server routes and client components can import it.
//
// - moralis: chain name for the Moralis Data API (holdings, NFTs, history, approvals)
// - etherscanFree: Etherscan V2's free plan covers this chain (Base and OP Mainnet moved to paid plans in 2025)
// - opensea: OpenSea chain slug, or null where OpenSea doesn't index the chain
// - rpc: free public JSON-RPC endpoint
// - defillama: chain name in DefiLlama's API (null for testnets)

export interface ChainInfo {
    key: string;
    name: string;
    chainId: number;
    testnet: boolean;
    layer2: boolean;
    native: string;
    moralis: string;
    etherscanFree: boolean;
    opensea: string | null;
    explorer: string;
    rpc: string;
    defillama: string | null;
}

export const CHAINS = {
    eth: { key: 'eth', name: 'Ethereum', chainId: 1, testnet: false, layer2: false, native: 'ETH', moralis: 'eth', etherscanFree: true, opensea: 'ethereum', explorer: 'https://etherscan.io', rpc: 'https://ethereum-rpc.publicnode.com', defillama: 'Ethereum' },
    base: { key: 'base', name: 'Base', chainId: 8453, testnet: false, layer2: true, native: 'ETH', moralis: 'base', etherscanFree: false, opensea: 'base', explorer: 'https://basescan.org', rpc: 'https://mainnet.base.org', defillama: 'Base' },
    arbitrum: { key: 'arbitrum', name: 'Arbitrum One', chainId: 42161, testnet: false, layer2: true, native: 'ETH', moralis: 'arbitrum', etherscanFree: true, opensea: 'arbitrum', explorer: 'https://arbiscan.io', rpc: 'https://arb1.arbitrum.io/rpc', defillama: 'Arbitrum' },
    optimism: { key: 'optimism', name: 'OP Mainnet', chainId: 10, testnet: false, layer2: true, native: 'ETH', moralis: 'optimism', etherscanFree: false, opensea: 'optimism', explorer: 'https://optimistic.etherscan.io', rpc: 'https://mainnet.optimism.io', defillama: 'OP Mainnet' },
    polygon: { key: 'polygon', name: 'Polygon PoS', chainId: 137, testnet: false, layer2: false, native: 'POL', moralis: 'polygon', etherscanFree: true, opensea: 'matic', explorer: 'https://polygonscan.com', rpc: 'https://polygon-rpc.com', defillama: 'Polygon' },
    linea: { key: 'linea', name: 'Linea', chainId: 59144, testnet: false, layer2: true, native: 'ETH', moralis: 'linea', etherscanFree: true, opensea: null, explorer: 'https://lineascan.build', rpc: 'https://rpc.linea.build', defillama: 'Linea' },
    sepolia: { key: 'sepolia', name: 'Sepolia', chainId: 11155111, testnet: true, layer2: false, native: 'ETH', moralis: 'sepolia', etherscanFree: true, opensea: null, explorer: 'https://sepolia.etherscan.io', rpc: 'https://ethereum-sepolia-rpc.publicnode.com', defillama: null },
    hoodi: { key: 'hoodi', name: 'Hoodi', chainId: 560048, testnet: true, layer2: false, native: 'ETH', moralis: '0x88bb0', etherscanFree: true, opensea: null, explorer: 'https://hoodi.etherscan.io', rpc: 'https://ethereum-hoodi-rpc.publicnode.com', defillama: null }
} as const satisfies Record<string, ChainInfo>;

export type ChainKey = keyof typeof CHAINS;
export const CHAIN_KEYS = Object.keys(CHAINS) as [ChainKey, ...ChainKey[]];

export function chainInfo(key: string): ChainInfo {
    return (CHAINS as Record<string, ChainInfo>)[key] ?? CHAINS.eth;
}

// Tokens on testnets have no market value
export function hasMarketValue(key: string): boolean {
    return !chainInfo(key).testnet;
}

export function chainByChainId(chainId: number): ChainInfo | undefined {
    return Object.values(CHAINS).find(c => c.chainId === chainId);
}

export function explorerTx(key: string, hash: string) {
    return chainInfo(key).explorer + '/tx/' + hash;
}

export function explorerAddress(key: string, address: string) {
    return chainInfo(key).explorer + '/address/' + address;
}
