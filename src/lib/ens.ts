import { labelhash } from "viem";
import { normalize } from "viem/ens";
import { rpcClient } from "./providers/rpc";

// ENS helpers built on free on-chain RPC calls
export const ENS_BASE_REGISTRAR = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';

export async function resolveEnsName(name: string): Promise<string | null> {
    return rpcClient.getEnsAddress({ name: normalize(name) });
}

export async function lookupEnsName(address: `0x${string}`): Promise<string | null> {
    return rpcClient.getEnsName({ address });
}

// Accepts an address or an ENS name and returns an address
export async function toAddress(input: string): Promise<string | null> {
    return input.startsWith('0x') ? input : resolveEnsName(input);
}

// The .eth base registrar token ID for a name is the labelhash of its first label, as a decimal string
export function ensTokenId(name: string): string {
    return BigInt(labelhash(normalize(name).split('.')[0])).toString(10);
}
