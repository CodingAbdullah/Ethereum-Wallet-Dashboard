import { createPublicClient, http, type PublicClient } from "viem";
import { chainByChainId } from "../chains";
import { mainnet } from "viem/chains";

// Ethereum JSON-RPC client. Defaults to a free public endpoint; set ETH_RPC_URL to a free-tier
// Alchemy/Infura/QuickNode URL for higher rate limits.
const RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';

export const rpcClient = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL, { timeout: 15000, retryCount: 1 })
});

// Public client for another supported chain (used to check sign-in signatures from smart wallets
// that only exist on an L2). Testnets and unknown chains use the mainnet client: plain wallet
// signatures verify the same on any chain.
const clients = new Map<number, PublicClient>();

export function rpcClientFor(chainId: number): PublicClient {
    const chain = chainByChainId(chainId);
    if (!chain || chain.chainId === 1 || chain.testnet) return rpcClient as PublicClient;

    let client = clients.get(chainId);
    if (!client) {
        client = createPublicClient({
            chain: { id: chain.chainId, name: chain.name, nativeCurrency: { name: chain.native, symbol: chain.native, decimals: 18 }, rpcUrls: { default: { http: [chain.rpc] } } },
            transport: http(chain.rpc, { timeout: 15000, retryCount: 1 })
        }) as PublicClient;
        clients.set(chainId, client);
    }
    return client;
}
