import { encodeFunctionData, erc20Abi, parseAbi, parseEther, parseUnits, zeroAddress, type Address } from "viem";
import { LIDO_STETH, WRAPPED_NATIVE } from "./contracts";
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

// --- Send ---

export type SendAsset = { kind: 'native'; symbol: string } | { kind: 'erc20'; address: string; symbol: string; decimals: number };

export function sendPlan(chain: ChainKey, asset: SendAsset, to: string, amount: string, recipientName?: string): TxPlan {
    const who = recipientName ?? short(to);
    if (asset.kind === 'native') {
        return { chain, title: `Send ${amount} ${asset.symbol} to ${who}`, calls: [{ to: to as Address, value: parseEther(amount).toString() }], screen: [to] };
    }
    return {
        chain,
        title: `Send ${amount} ${asset.symbol} to ${who}`,
        calls: [{ to: asset.address as Address, data: encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [to as Address, parseUnits(amount, asset.decimals)] }) }],
        screen: [to]
    };
}

// --- Wrap / unwrap ---

const wethAbi = parseAbi(['function deposit() payable', 'function withdraw(uint256 wad)']);

export function wrapPlan(chain: ChainKey, amount: string, native: string): TxPlan {
    const weth = WRAPPED_NATIVE[chain];
    if (!weth) throw new Error('Wrapping is not available on this network');
    return { chain, title: `Wrap ${amount} ${native} into ${weth.symbol}`, description: `${weth.symbol} is ${native} as an ERC20 token, 1:1. You can unwrap it at any time.`,
        calls: [{ to: weth.address, data: encodeFunctionData({ abi: wethAbi, functionName: 'deposit' }), value: parseEther(amount).toString() }] };
}

export function unwrapPlan(chain: ChainKey, amount: string, native: string): TxPlan {
    const weth = WRAPPED_NATIVE[chain];
    if (!weth) throw new Error('Unwrapping is not available on this network');
    return { chain, title: `Unwrap ${amount} ${weth.symbol} into ${native}`,
        calls: [{ to: weth.address, data: encodeFunctionData({ abi: wethAbi, functionName: 'withdraw', args: [parseEther(amount)] }) }] };
}

// --- Liquid staking (Ethereum mainnet) ---

const lidoAbi = parseAbi(['function submit(address _referral) payable returns (uint256)']);
const rocketDepositAbi = parseAbi(['function deposit() payable']);

export function lidoStakePlan(amount: string): TxPlan {
    return { chain: 'eth', title: `Stake ${amount} ETH with Lido`, description: 'You receive stETH 1:1. Its balance grows daily with staking rewards. Lido withdrawals take days; you can also swap stETH back to ETH.',
        calls: [{ to: LIDO_STETH, data: encodeFunctionData({ abi: lidoAbi, functionName: 'submit', args: [zeroAddress] }), value: parseEther(amount).toString() }] };
}

export function rocketPoolStakePlan(depositPool: string, amount: string): TxPlan {
    return { chain: 'eth', title: `Stake ${amount} ETH with Rocket Pool`, description: 'You receive rETH, which grows in value against ETH as rewards accrue. Rocket Pool charges a small deposit fee; the preview shows the exact rETH you get.',
        calls: [{ to: depositPool as Address, data: encodeFunctionData({ abi: rocketDepositAbi, functionName: 'deposit' }), value: parseEther(amount).toString() }] };
}
