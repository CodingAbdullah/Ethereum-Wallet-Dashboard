import { erc20Abi, type Address, type PublicClient } from "viem";
import type { TokenApproval } from "../walletInsights";

// Moralis approvals can be a few minutes behind the chain (cached, indexed). Before showing the list
// on the approvals manager, read each allowance on-chain in one multicall and drop the ones already at 0,
// so a revoke disappears as soon as it is mined. If the multicall fails, the Moralis list is used as is.
export async function withLiveAllowances(client: PublicClient, owner: Address, approvals: TokenApproval[]): Promise<{ approvals: TokenApproval[]; verified: boolean }> {
    if (approvals.length === 0) return { approvals, verified: true };
    try {
        const results = await client.multicall({
            contracts: approvals.map(a => ({ address: a.tokenAddress as Address, abi: erc20Abi, functionName: 'allowance' as const, args: [owner, a.spender as Address] as const })),
            allowFailure: true
        });
        return {
            approvals: approvals.filter((_, i) => results[i].status !== 'success' || (results[i].result as bigint) > BigInt(0)),
            verified: true
        };
    }
    catch {
        return { approvals, verified: false };
    }
}
