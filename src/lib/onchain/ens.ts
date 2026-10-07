import { encodeFunctionData, labelhash, namehash, parseAbi, type Address, type Hex } from "viem";
import { normalize } from "viem/ens";
import type { TxPlan } from "@/app/hooks/useTxFlow";

// ENS management on Ethereum mainnet: register (commit, wait, register), renew, primary name and records.
// Safe in the browser: only encodes calls. Reading names and checking the controller is in ensStatus.ts.

export const ENS = {
    registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as Address,
    baseRegistrar: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85' as Address,
    controller: '0x253553366Da8546fC250F225fe3d25d0C782303b' as Address,        // ETHRegistrarController (wrapped names)
    reverseRegistrar: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb' as Address,
    publicResolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' as Address,
    nameWrapper: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401' as Address
};

export const controllerAbi = parseAbi([
    'struct Price { uint256 base; uint256 premium; }',
    'function available(string name) view returns (bool)',
    'function rentPrice(string name, uint256 duration) view returns (Price)',
    'function minCommitmentAge() view returns (uint256)',
    'function makeCommitment(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)',
    'function commit(bytes32 commitment)',
    'function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) payable',
    'function renew(string name, uint256 duration) payable'
]);
export const resolverAbi = parseAbi([
    'function addr(bytes32 node) view returns (address)',
    'function text(bytes32 node, string key) view returns (string)',
    'function setAddr(bytes32 node, address a)',
    'function setText(bytes32 node, string key, string value)',
    'function multicall(bytes[] data) returns (bytes[])'
]);
const reverseAbi = parseAbi(['function setName(string name) returns (bytes32)']);

export const YEAR = 365 * 24 * 60 * 60;
export const TEXT_KEYS = ['avatar', 'url', 'description', 'email', 'com.twitter', 'com.github'] as const;

// "Vitalik.ETH" -> { name: "vitalik.eth", label: "vitalik" }; only names directly under .eth can be registered
export function parseEthName(input: string): { name: string; label: string; isSecondLevel: boolean } {
    const name = normalize(input.trim().toLowerCase().endsWith('.eth') ? input.trim() : input.trim() + '.eth');
    const parts = name.split('.');
    return { name, label: parts[0], isSecondLevel: parts.length === 2 && parts[1] === 'eth' };
}

// The controller refunds anything above the price, so a 5% buffer covers ETH/USD moves between quote and signing
export const withBuffer = (price: bigint) => price * BigInt(105) / BigInt(100);

export function commitPlan(name: string, commitment: Hex): TxPlan {
    return {
        chain: 'eth',
        title: `Reserve ${name} (step 1 of 2)`,
        description: 'This hides which name you want for a minute, so nobody can front-run your registration. Step 2 registers it.',
        calls: [{ to: ENS.controller, data: encodeFunctionData({ abi: controllerAbi, functionName: 'commit', args: [commitment] }) }]
    };
}

export function registerPlan(o: { label: string; owner: Address; years: number; secret: Hex; price: bigint; setPrimary: boolean }): TxPlan {
    const duration = BigInt(o.years * YEAR);
    // Point the new name at the owner's address straight away
    const node = namehash(`${o.label}.eth`);
    const data = [encodeFunctionData({ abi: resolverAbi, functionName: 'setAddr', args: [node, o.owner] })];
    return {
        chain: 'eth',
        title: `Register ${o.label}.eth for ${o.years} year${o.years === 1 ? '' : 's'} (step 2 of 2)`,
        description: `Includes a 5% buffer for price moves; anything not needed is refunded in the same transaction.${o.setPrimary ? ' Also sets it as your primary name.' : ''}`,
        calls: [{
            to: ENS.controller,
            data: encodeFunctionData({ abi: controllerAbi, functionName: 'register', args: [o.label, o.owner, duration, o.secret, ENS.publicResolver, data, o.setPrimary, 0] }),
            value: withBuffer(o.price).toString()
        }]
    };
}

export function renewPlan(label: string, years: number, price: bigint): TxPlan {
    return {
        chain: 'eth',
        title: `Renew ${label}.eth for ${years} year${years === 1 ? '' : 's'}`,
        description: 'Anyone can renew any name; it stays with its owner. A 5% price buffer is included and the rest refunded.',
        calls: [{ to: ENS.controller, data: encodeFunctionData({ abi: controllerAbi, functionName: 'renew', args: [label, BigInt(years * YEAR)] }), value: withBuffer(price).toString() }]
    };
}

export function primaryNamePlan(name: string): TxPlan {
    return {
        chain: 'eth',
        title: `Set ${name} as your primary name`,
        description: 'Apps will show this name instead of your address.',
        calls: [{ to: ENS.reverseRegistrar, data: encodeFunctionData({ abi: reverseAbi, functionName: 'setName', args: [name] }) }]
    };
}

export interface RecordChanges { addr?: Address; texts: Partial<Record<string, string>> }

// All record changes in one transaction (resolver multicall)
export function recordsPlan(name: string, resolver: Address, changes: RecordChanges): TxPlan {
    const node = namehash(name);
    const calls: Hex[] = Object.entries(changes.texts).map(([key, value]) => encodeFunctionData({ abi: resolverAbi, functionName: 'setText', args: [node, key, value ?? ''] }));
    if (changes.addr) calls.unshift(encodeFunctionData({ abi: resolverAbi, functionName: 'setAddr', args: [node, changes.addr] }));
    if (calls.length === 0) throw new Error('Nothing to change');
    return {
        chain: 'eth',
        title: `Update ${calls.length} record${calls.length === 1 ? '' : 's'} on ${name}`,
        calls: [{ to: resolver, data: calls.length === 1 ? calls[0] : encodeFunctionData({ abi: resolverAbi, functionName: 'multicall', args: [calls] }) }]
    };
}

export const tokenIdOf = (label: string) => BigInt(labelhash(label));
