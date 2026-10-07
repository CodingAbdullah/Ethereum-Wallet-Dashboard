import { describe, expect, it, vi } from "vitest";
import { decodeFunctionData, namehash, parseAbi, type PublicClient } from "viem";
import { commitPlan, controllerAbi, ENS, parseEthName, primaryNamePlan, recordsPlan, registerPlan, renewPlan, resolverAbi, withBuffer, YEAR } from "./ens";
import { getEnsNameStatus } from "./ensStatus";

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const SECRET = ('0x' + '11'.repeat(32)) as `0x${string}`;
const RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

describe("ENS plans", () => {
    it("normalizes names and spots second-level .eth names", () => {
        expect(parseEthName('Vitalik')).toEqual({ name: 'vitalik.eth', label: 'vitalik', isSecondLevel: true });
        expect(parseEthName('pay.Vitalik.eth')).toMatchObject({ name: 'pay.vitalik.eth', isSecondLevel: false });
    });

    it("commits, then registers with the address record, primary name and a refunded 5% buffer", () => {
        const commit = commitPlan('alice.eth', SECRET);
        expect(commit.calls[0].to).toBe(ENS.controller);
        expect(decodeFunctionData({ abi: controllerAbi, data: commit.calls[0].data as `0x${string}` })).toEqual({ functionName: 'commit', args: [SECRET] });

        const price = BigInt('3000000000000000');
        const reg = registerPlan({ label: 'alice', owner: OWNER, years: 2, secret: SECRET, price, setPrimary: true });
        expect(reg.calls[0].value).toBe(withBuffer(price).toString());
        expect(withBuffer(BigInt(100))).toBe(BigInt(105));
        const decoded = decodeFunctionData({ abi: controllerAbi, data: reg.calls[0].data as `0x${string}` });
        expect(decoded.functionName).toBe('register');
        const [label, owner, duration, secret, resolver, data, reverse, fuses] = decoded.args as unknown as unknown[];
        expect([label, owner, duration, secret, resolver, reverse, fuses]).toEqual(['alice', OWNER, BigInt(2 * YEAR), SECRET, ENS.publicResolver, true, 0]);
        expect(decodeFunctionData({ abi: resolverAbi, data: (data as `0x${string}`[])[0] })).toEqual({ functionName: 'setAddr', args: [namehash('alice.eth'), OWNER] });
    });

    it("renews and sets the primary name", () => {
        const renew = renewPlan('alice', 3, BigInt(1000));
        expect(decodeFunctionData({ abi: controllerAbi, data: renew.calls[0].data as `0x${string}` })).toEqual({ functionName: 'renew', args: ['alice', BigInt(3 * YEAR)] });
        expect(renew.calls[0].value).toBe('1050');
        const primary = primaryNamePlan('alice.eth');
        expect(primary.calls[0].to).toBe(ENS.reverseRegistrar);
        expect(decodeFunctionData({ abi: parseAbi(['function setName(string name) returns (bytes32)']), data: primary.calls[0].data as `0x${string}` }).args).toEqual(['alice.eth']);
    });

    it("bundles record changes into one resolver multicall", () => {
        const one = recordsPlan('alice.eth', RESOLVER, { texts: { url: 'https://alice.dev' } });
        expect(decodeFunctionData({ abi: resolverAbi, data: one.calls[0].data as `0x${string}` })).toEqual({ functionName: 'setText', args: [namehash('alice.eth'), 'url', 'https://alice.dev'] });
        const many = recordsPlan('alice.eth', RESOLVER, { addr: OWNER, texts: { 'com.twitter': 'alice', description: '' } });
        expect(many.title).toBe('Update 3 records on alice.eth');
        const outer = decodeFunctionData({ abi: resolverAbi, data: many.calls[0].data as `0x${string}` });
        expect(outer.functionName).toBe('multicall');
        expect((outer.args[0] as `0x${string}`[]).map(d => decodeFunctionData({ abi: resolverAbi, data: d }).functionName)).toEqual(['setAddr', 'setText', 'setText']);
        expect(() => recordsPlan('alice.eth', RESOLVER, { texts: {} })).toThrow('Nothing to change');
    });
});

describe("getEnsNameStatus", () => {
    it("reads a wrapped name's real owner, expiry, price and records", async () => {
        const readContract = vi.fn(async ({ address, functionName }: { address: string; functionName: string }) => {
            if (functionName === 'owner') return ENS.nameWrapper;
            if (functionName === 'resolver') return RESOLVER;
            if (functionName === 'controllers') return true;
            if (functionName === 'available') return false;
            if (functionName === 'nameExpires') return BigInt(1_800_000_000);
            if (functionName === 'rentPrice') return { base: BigInt(5), premium: BigInt(1) };
            if (functionName === 'ownerOf' && address === ENS.nameWrapper) return OWNER;
            if (functionName === 'addr') return OWNER;
            if (functionName === 'text') return '';
            throw new Error('unexpected ' + functionName);
        });
        const status = await getEnsNameStatus({ readContract } as unknown as PublicClient, 'Alice');
        expect(status).toMatchObject({ name: 'alice.eth', available: false, owner: OWNER, resolver: RESOLVER, yearlyPrice: '6', controllerAuthorized: true, expires: new Date(1_800_000_000_000).toISOString(), records: { addr: OWNER, texts: {} } });
    });

    it("flags a controller ENS no longer uses", async () => {
        const readContract = vi.fn(async ({ functionName }: { functionName: string }) => {
            if (functionName === 'controllers') return false;
            if (functionName === 'available') return true;
            if (functionName === 'owner' || functionName === 'resolver') return '0x0000000000000000000000000000000000000000';
            throw new Error('no');
        });
        const status = await getEnsNameStatus({ readContract } as unknown as PublicClient, 'brand-new-name.eth');
        expect(status).toMatchObject({ available: true, controllerAuthorized: false, owner: null, resolver: null, yearlyPrice: null });
    });
});
