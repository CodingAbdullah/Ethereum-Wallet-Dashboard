import { createPublicClient, http, type PublicClient } from "viem";
import { chainByChainId, CHAINS, type ChainKey } from "../chains";
import { mainnet } from "viem/chains";

// Ethereum JSON-RPC client. Defaults to a free public endpoint; set ETH_RPC_URL to a free-tier
// Alchemy/Infura/QuickNode URL for higher rate limits.
const RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';

export const rpcClient = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL, { timeout: 15000, retryCount: 1 })
});

// Public client for a supported chain on its own RPC (testnets included), used for simulating and
// reading state before a transaction. Mainnet uses ETH_RPC_URL; other chains can be pointed at a
// free-tier provider with RPC_URL_<CHAIN> (e.g. RPC_URL_BASE), otherwise their free public endpoint.
const clients = new Map<string, PublicClient>();

export function chainRpcUrl(key: ChainKey, env: Record<string, string | undefined> = process.env): string {
    if (key === 'eth') return RPC_URL;
    return env['RPC_URL_' + key.toUpperCase()] || CHAINS[key].rpc;
}

export function chainClient(key: ChainKey): PublicClient {
    if (key === 'eth') return rpcClient as PublicClient;
    let client = clients.get(key);
    if (!client) {
        const chain = CHAINS[key];
        const url = chainRpcUrl(key);
        client = createPublicClient({
            chain: { id: chain.chainId, name: chain.name, nativeCurrency: { name: chain.native, symbol: chain.native, decimals: 18 }, rpcUrls: { default: { http: [url] } }, testnet: chain.testnet },
            transport: http(url, { timeout: 15000, retryCount: 1 })
        }) as PublicClient;
        clients.set(key, client);
    }
    return client;
}

// Public client for another supported chain (used to check sign-in signatures from smart wallets
// that only exist on an L2). Testnets and unknown chains use the mainnet client: plain wallet
// signatures verify the same on any chain.
export function rpcClientFor(chainId: number): PublicClient {
    const chain = chainByChainId(chainId);
    if (!chain || chain.chainId === 1 || chain.testnet) return rpcClient as PublicClient;
    return chainClient(chain.key as ChainKey);
}
