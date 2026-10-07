import { describe, expect, it, vi } from "vitest";
import { parseAbiItem, type AbiFunction, type PublicClient } from "viem";

vi.mock("../providers/etherscan", () => ({ etherscan: vi.fn() }));
vi.mock("../providers/http", async importOriginal => ({ ...await importOriginal<object>(), providerFetch: vi.fn() }));

import { etherscan } from "../providers/etherscan";
import { providerFetch, ProviderError } from "../providers/http";
import { getContractAbi } from "./contractAbi";
import { formatResult, InputError, parseArgs } from "./abiInput";

const PROXY = '0x1111111111111111111111111111111111111111';
const IMPL = '0x2222222222222222222222222222222222222222';
const fn = (sig: string) => parseAbiItem(sig) as AbiFunction;
const client = (slot: string | undefined) => ({ getStorageAt: vi.fn(async () => slot) }) as unknown as PublicClient;

describe("parseArgs", () => {
    it("parses each ABI type from text", () => {
        const f = fn('function f(address to, uint256 amount, bool flag, bytes32 id, string note, address[] list, (uint8 a, address b) pair)');
        const id = '0x' + 'ab'.repeat(32);
        expect(parseArgs(f, ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '1000', 'true', id, 'hi', `["${PROXY}"]`, `[7, "${IMPL}"]`])).toEqual([
            '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', BigInt(1000), true, id, 'hi', [PROXY], { a: BigInt(7), b: IMPL }
        ]);
    });

    it("explains bad input", () => {
        expect(() => parseArgs(fn('function f(address to)'), ['0x12'])).toThrow(InputError);
        expect(() => parseArgs(fn('function f(uint256 amount)'), ['1.5'])).toThrow('whole number');
        expect(() => parseArgs(fn('function f(uint256 amount)'), ['-1'])).toThrow("can't be negative");
        expect(() => parseArgs(fn('function f(bytes32 id)'), ['0x1234'])).toThrow('exactly 32 bytes');
        expect(() => parseArgs(fn('function f(address[2] list)'), [`["${PROXY}"]`])).toThrow('expected 2 items');
        expect(() => parseArgs(fn('function f(address[] list)'), ['not json'])).toThrow('expected JSON');
    });

    it("formats results", () => {
        expect(formatResult(BigInt('123456789012345678901234567890'))).toBe('123456789012345678901234567890');
        expect(formatResult(true)).toBe('true');
        expect(formatResult([BigInt(1), 'x'])).toBe('[\n  "1",\n  "x"\n]');
    });
});

describe("getContractAbi", () => {
    it("follows an EIP-1967 proxy and merges the implementation's functions first", async () => {
        vi.mocked(etherscan).mockImplementation((async (params: Record<string, string>) => ({
            status: '1', message: 'OK',
            result: [params.address === PROXY
                ? { ABI: JSON.stringify([fn('function upgradeTo(address impl)'), fn('function balanceOf(address who) view returns (uint256)')]), ContractName: 'Proxy', Implementation: '' }
                : { ABI: JSON.stringify([fn('function balanceOf(address who) view returns (uint256)'), fn('function transfer(address to, uint256 v) returns (bool)')]), ContractName: 'Token', Implementation: '' }]
        })) as never);
        const abi = await getContractAbi(client('0x000000000000000000000000' + IMPL.slice(2)), 'eth', PROXY);
        expect(abi).toMatchObject({ name: 'Token', source: 'etherscan', implementation: '0x2222222222222222222222222222222222222222' });
        expect(abi!.functions.map(f => f.name)).toEqual(['balanceOf', 'transfer', 'upgradeTo']);
    });

    it("uses Sourcify where Etherscan's free plan doesn't reach, and returns null when unverified", async () => {
        vi.mocked(etherscan).mockClear();
        vi.mocked(providerFetch).mockResolvedValueOnce({ abi: [fn('function name() view returns (string)')], compilation: { name: 'Thing' } });
        const abi = await getContractAbi(client('0x' + '0'.repeat(64)), 'base', PROXY);
        expect(etherscan).not.toHaveBeenCalled();
        expect(abi).toMatchObject({ name: 'Thing', source: 'sourcify', implementation: null, functions: [{ name: 'name' }] });

        vi.mocked(providerFetch).mockRejectedValueOnce(new ProviderError('Sourcify', 404, 'not found'));
        expect(await getContractAbi(client(undefined), 'base', PROXY)).toBeNull();
    });
});
