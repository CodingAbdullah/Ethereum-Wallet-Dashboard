import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// Ethereum JSON-RPC client. Defaults to a free public endpoint; set ETH_RPC_URL to a free-tier
// Alchemy/Infura/QuickNode URL for higher rate limits.
const RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';

export const rpcClient = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL, { timeout: 15000, retryCount: 1 })
});
