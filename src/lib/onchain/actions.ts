import { encodeFunctionData, erc20Abi, type Address } from "viem";
import type { ChainKey } from "../chains";
import type { TxPlan } from "@/app/hooks/useTxFlow";

// Builders for the transactions behind each action. Pure functions (safe in the browser):
// they only encode calldata; simulating, signing and sending happen in the transaction flow.

const short = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);

export interface RevokeTarget { tokenAddress: string; tokenSymbol: string; spender: string; spenderLabel: string | null }

export function revokePlan(chain: ChainKey, targets: RevokeTarget[]): TxPlan {
    const one = targets.length === 1 ? targets[0] : null;
    return {
        chain,
        title: one ? `Revoke ${one.tokenSymbol} approval for ${one.spenderLabel ?? short(one.spender)}` : `Revoke ${targets.length} approvals`,
        description: one
            ? `Sets the allowance to 0, so ${one.spenderLabel ?? 'this spender'} can no longer move your ${one.tokenSymbol}.`
            : 'Sets each allowance to 0. Your wallet will ask you to confirm each one.',
        calls: targets.map(t => ({
            to: t.tokenAddress as Address,
            data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [t.spender as Address, BigInt(0)] })
        }))
    };
}
