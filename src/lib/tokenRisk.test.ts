import { describe, expect, it } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { assessToken, getTokenRisks } from "./tokenRisk";

describe("assessToken", () => {
    it("flags honeypots and huge sell taxes as danger", () => {
        const risk = assessToken('0xABC', { is_honeypot: '1', sell_tax: '0.99', buy_tax: '0', is_open_source: '1' });
        expect(risk.level).toBe('danger');
        expect(risk.findings.map(f => f.text)).toEqual(['Honeypot: tokens can be bought but not sold', 'Sell tax of 99%']);
        expect(risk.address).toBe('0xabc');
    });

    it("marks owner powers and taxes as caution", () => {
        const risk = assessToken('0x1', { is_mintable: '1', is_proxy: '1', buy_tax: '0.1', sell_tax: '0.08', is_open_source: '0' });
        expect(risk.level).toBe('caution');
        expect(risk.findings.map(f => f.text)).toEqual([
            'The owner can mint new tokens', 'Upgradeable proxy: the code can be changed', "Contract source code isn't verified", 'Buy/sell tax up to 10%'
        ]);
    });

    it("treats trusted tokens with only caution flags as ok, but never hides danger", () => {
        // USDC-like: proxy and blacklist, on GoPlus's trust list
        expect(assessToken('0x1', { is_proxy: '1', is_blacklisted: '1', trust_list: '1', is_open_source: '1', holder_count: '2500000' }))
            .toMatchObject({ level: 'ok', trusted: true, holders: 2500000 });
        expect(assessToken('0x1', { is_honeypot: '1', trust_list: '1' }).level).toBe('danger');
    });

    it("is ok when nothing is flagged, and tolerates missing data", () => {
        expect(assessToken('0x1', { is_open_source: '1', buy_tax: '0', sell_tax: '0' })).toMatchObject({ level: 'ok', findings: [] });
        expect(assessToken('0x1', null)).toMatchObject({ level: 'ok', buyTax: null });
    });
});

describe("getTokenRisks", () => {
    it("batches addresses per chain and keys results by lowercase address", async () => {
        const fetchMock = mockFetch(json({ code: 1, result: { '0xaaa': { is_honeypot: '1' }, '0xbbb': { is_open_source: '1' } } }));
        const risks = await getTokenRisks('base', ['0xBBB', '0xAAA', '0xaaa']);
        expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.gopluslabs.io/api/v1/token_security/8453?contract_addresses=0xaaa,0xbbb');
        expect(risks['0xaaa'].level).toBe('danger');
        expect(risks['0xbbb'].level).toBe('ok');
        expect(await getTokenRisks('eth', [])).toEqual({});
    });
});
