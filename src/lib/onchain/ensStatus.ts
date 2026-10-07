import { encodeFunctionData, isAddressEqual, namehash, parseAbi, zeroAddress, type Address, type Hex, type PublicClient } from "viem";
import { controllerAbi, ENS, parseEthName, resolverAbi, TEXT_KEYS, tokenIdOf, YEAR } from "./ens";

// Everything the ENS manager needs to know about a name, read on-chain (Ethereum mainnet).

const registryAbi = parseAbi(['function owner(bytes32 node) view returns (address)', 'function resolver(bytes32 node) view returns (address)']);
const baseRegistrarAbi = parseAbi(['function nameExpires(uint256 id) view returns (uint256)', 'function controllers(address) view returns (bool)']);
const wrapperAbi = parseAbi(['function ownerOf(uint256 id) view returns (address)']);

export interface EnsNameStatus {
    name: string;
    label: string;
    isSecondLevel: boolean;
    available: boolean | null;
    expires: string | null;             // ISO date
    owner: Address | null;              // registrant (unwrapped through the NameWrapper)
    resolver: Address | null;
    yearlyPrice: string | null;         // wei for one year (base + premium)
    controllerAuthorized: boolean;      // false if ENS has moved registrations to a new contract
    records: { addr: Address | null; texts: Record<string, string> };
}

const ok = <T>(p: Promise<T>) => p.then(v => v, () => null);

export async function getEnsNameStatus(client: PublicClient, input: string): Promise<EnsNameStatus> {
    const { name, label, isSecondLevel } = parseEthName(input);
    const node = namehash(name);
    const [registryOwner, resolverRaw, controllerAuthorized, available, expiresRaw, price] = await Promise.all([
        ok(client.readContract({ address: ENS.registry, abi: registryAbi, functionName: 'owner', args: [node] })),
        ok(client.readContract({ address: ENS.registry, abi: registryAbi, functionName: 'resolver', args: [node] })),
        ok(client.readContract({ address: ENS.baseRegistrar, abi: baseRegistrarAbi, functionName: 'controllers', args: [ENS.controller] })),
        isSecondLevel ? ok(client.readContract({ address: ENS.controller, abi: controllerAbi, functionName: 'available', args: [label] })) : null,
        isSecondLevel ? ok(client.readContract({ address: ENS.baseRegistrar, abi: baseRegistrarAbi, functionName: 'nameExpires', args: [tokenIdOf(label)] })) : null,
        isSecondLevel ? ok(client.readContract({ address: ENS.controller, abi: controllerAbi, functionName: 'rentPrice', args: [label, BigInt(YEAR)] })) : null
    ]);

    let owner = registryOwner && !isAddressEqual(registryOwner, zeroAddress) ? registryOwner : null;
    if (owner && isAddressEqual(owner, ENS.nameWrapper)) {
        owner = await ok(client.readContract({ address: ENS.nameWrapper, abi: wrapperAbi, functionName: 'ownerOf', args: [BigInt(node)] }));
    }
    const resolver = resolverRaw && !isAddressEqual(resolverRaw, zeroAddress) ? resolverRaw : null;

    const records: EnsNameStatus['records'] = { addr: null, texts: {} };
    if (resolver) {
        const [addr, ...texts] = await Promise.all([
            ok(client.readContract({ address: resolver, abi: resolverAbi, functionName: 'addr', args: [node] })),
            ...TEXT_KEYS.map(key => ok(client.readContract({ address: resolver, abi: resolverAbi, functionName: 'text', args: [node, key] })))
        ]);
        records.addr = addr && !isAddressEqual(addr as Address, zeroAddress) ? addr as Address : null;
        TEXT_KEYS.forEach((key, i) => { if (texts[i]) records.texts[key] = texts[i] as string; });
    }

    return {
        name, label, isSecondLevel,
        available: available ?? null,
        expires: expiresRaw && expiresRaw > BigInt(0) ? new Date(Number(expiresRaw) * 1000).toISOString() : null,
        owner, resolver,
        yearlyPrice: price ? (price.base + price.premium).toString() : null,
        controllerAuthorized: controllerAuthorized === true,
        records
    };
}

export async function getCommitment(client: PublicClient, o: { label: string; owner: Address; years: number; secret: Hex; setPrimary: boolean }) {
    const node = namehash(`${o.label}.eth`);
    const data = [encodeFunctionData({ abi: resolverAbi, functionName: 'setAddr', args: [node, o.owner] })];
    const [commitment, minAge] = await Promise.all([
        client.readContract({ address: ENS.controller, abi: controllerAbi, functionName: 'makeCommitment', args: [o.label, o.owner, BigInt(o.years * YEAR), o.secret, ENS.publicResolver, data, o.setPrimary, 0] }),
        client.readContract({ address: ENS.controller, abi: controllerAbi, functionName: 'minCommitmentAge' })
    ]);
    return { commitment, minCommitmentAge: Number(minAge) };
}
