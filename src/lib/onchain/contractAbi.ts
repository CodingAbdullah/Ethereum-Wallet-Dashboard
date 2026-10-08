import { getAddress, toFunctionSignature, type Abi, type AbiFunction, type Address, type PublicClient } from "viem";
import { CHAINS, type ChainKey } from "../chains";
import { etherscan } from "../providers/etherscan";
import { providerFetch } from "../providers/http";

// A verified contract's functions, for the contract explorer (/contract).
// The ABI comes from Etherscan (on chains its free plan covers) or Sourcify (free, keyless, every chain).
// Proxies (EIP-1967) are followed: calls go to the proxy address with the implementation's functions.

export interface ContractAbi {
    name: string | null;
    functions: AbiFunction[];
    source: 'etherscan' | 'sourcify';
    implementation: Address | null;
}

// keccak256("eip1967.proxy.implementation") - 1
const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

export async function proxyImplementation(client: PublicClient, address: Address): Promise<Address | null> {
    const raw = await client.getStorageAt({ address, slot: IMPLEMENTATION_SLOT }).catch(() => undefined);
    if (!raw || /^0x0*$/.test(raw)) return null;
    return getAddress('0x' + raw.slice(-40));
}

interface Verified { name: string | null; abi: Abi; source: ContractAbi['source']; implementation: Address | null }

async function fromEtherscan(chain: ChainKey, address: Address): Promise<Verified | null> {
    if (!CHAINS[chain].etherscanFree) return null;
    const { result } = await etherscan<{ ABI: string; ContractName: string; Implementation: string }[]>({ module: 'contract', action: 'getsourcecode', address }, chain as never, 86400);
    const item = Array.isArray(result) ? result[0] : undefined;
    if (!item || !item.ABI || item.ABI.startsWith('Contract source code not verified')) return null;
    return { name: item.ContractName || null, abi: JSON.parse(item.ABI) as Abi, source: 'etherscan', implementation: /^0x[0-9a-fA-F]{40}$/.test(item.Implementation) ? getAddress(item.Implementation) : null };
}

async function fromSourcify(chain: ChainKey, address: Address): Promise<Verified | null> {
    try {
        const data = await providerFetch<{ abi?: Abi; compilation?: { name?: string } }>(
            'Sourcify', `https://sourcify.dev/server/v2/contract/${CHAINS[chain].chainId}/${address}?fields=abi,compilation`, { revalidate: 86400 }
        );
        return data.abi ? { name: data.compilation?.name ?? null, abi: data.abi, source: 'sourcify', implementation: null } : null;
    }
    catch (err) {
        if ((err as { status?: number }).status === 404) return null;
        throw err;
    }
}

async function verifiedAbi(chain: ChainKey, address: Address): Promise<Verified | null> {
    const etherscanResult = await fromEtherscan(chain, address).catch(() => null);
    return etherscanResult ?? fromSourcify(chain, address);
}

const functionsOf = (abi: Abi) => abi.filter((item): item is AbiFunction => item.type === 'function');

export async function getContractAbi(client: PublicClient, chain: ChainKey, address: Address): Promise<ContractAbi | null> {
    const [own, slotImplementation] = await Promise.all([verifiedAbi(chain, address), proxyImplementation(client, address)]);
    const implementation = own?.implementation ?? slotImplementation;
    const impl = implementation ? await verifiedAbi(chain, implementation).catch(() => null) : null;
    if (!own && !impl) return null;

    // Implementation functions first (that's the contract's real interface), then the proxy's own, without duplicates
    const seen = new Set<string>();
    const functions = [...functionsOf(impl?.abi ?? []), ...functionsOf(own?.abi ?? [])].filter(f => {
        const signature = toFunctionSignature(f);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
    });
    return { name: impl?.name ?? own?.name ?? null, functions, source: (own ?? impl)!.source, implementation: impl ? implementation : null };
}
