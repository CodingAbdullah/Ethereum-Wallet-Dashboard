import { describe, expect, it } from "vitest";
import { searchSuggestions } from "./search";

const ids = (q: string) => searchSuggestions(q).map(s => s.id);

describe("searchSuggestions", () => {
    it("detects addresses, transaction hashes and block numbers", () => {
        expect(ids('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045').slice(0, 3)).toEqual(['address', 'wallet', 'token']);
        expect(searchSuggestions('0x' + 'ab'.repeat(32))[0]).toMatchObject({ id: 'tx', href: '/tx/0x' + 'ab'.repeat(32) });
        expect(searchSuggestions('21,000,000')[0]).toMatchObject({ id: 'block', href: '/block/21000000', label: 'Open block 21,000,000' });
    });

    it("turns ENS names into a resolve action, normalized", () => {
        expect(searchSuggestions('Vitalik.ETH')[0]).toMatchObject({ id: 'ens', resolveEns: 'vitalik.eth' });
        expect(ids('not valid..eth')).not.toContain('ens');
    });

    it("finds pages by name and keywords", () => {
        expect(ids('gas')).toContain('page:/gas-tracker');
        expect(ids('funding rate')).toContain('page:/derivatives');
        expect(ids('stage')).toContain('page:/l2');
        expect(ids('staking')[0]).toBe('page:/staking');
    });

    it("offers a coin price link for single words, and nothing for empty input", () => {
        expect(searchSuggestions('bitcoin').at(-1)).toMatchObject({ id: 'coin', href: '/prices/bitcoin' });
        expect(searchSuggestions('   ')).toEqual([]);
        expect(ids('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).not.toContain('coin');
    });

    it("never returns more than 8 suggestions", () => {
        expect(searchSuggestions('e').length).toBeLessThanOrEqual(8);
    });
});
