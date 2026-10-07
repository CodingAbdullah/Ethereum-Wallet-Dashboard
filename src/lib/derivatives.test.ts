import { describe, expect, it, vi } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { fromBybit, fromDeribitFutures, fromDeribitOptions, fromOkx, getDerivatives } from "./derivatives";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

const deribitFutures = { result: [
    { instrument_name: 'ETH-27DEC24', mark_price: 3010, open_interest: 1e8 },
    { instrument_name: 'ETH-PERPETUAL', mark_price: 3000.5, funding_8h: 0.0001, open_interest: 6e8, volume_usd: 9e8 }
] };
const okx = {
    funding: { code: '0', data: [{ instId: 'ETH-USDT-SWAP', fundingRate: '0.00005' }] },
    oi: { code: '0', data: [{ instId: 'ETH-USDT-SWAP', oi: '1000000', oiCcy: '100000' }] },
    ticker: { code: '0', data: [{ instId: 'ETH-USDT-SWAP', last: '3001', volCcy24h: '200000' }] }
};
const bybit = { retCode: 0, result: { category: 'linear', list: [{ symbol: 'ETHUSDT', lastPrice: '2999.9', fundingRate: '-0.00002', openInterestValue: '1500000000', turnover24h: '4000000000' }] } };
const options = { result: [
    { instrument_name: 'ETH-27DEC24-4000-C', open_interest: 100, volume_usd: 1000 },
    { instrument_name: 'ETH-27DEC24-2500-P', open_interest: 50, volume_usd: 500 },
    { instrument_name: 'ETH-31JAN25-5000-C', open_interest: 25, volume_usd: 0 },
    { instrument_name: 'garbage', open_interest: 999 }
] };

describe("derivatives parsers", () => {
    it("reads the Deribit perpetual", () => {
        expect(fromDeribitFutures(deribitFutures)).toMatchObject({ exchange: 'Deribit', price: 3000.5, funding8h: 0.0001, openInterestUsd: 6e8, volume24hUsd: 9e8 });
        expect(fromDeribitFutures(deribitFutures).fundingAnnualized).toBeCloseTo(0.1095);
        expect(() => fromDeribitFutures({ result: [] })).toThrow();
    });

    it("reads OKX, converting coin amounts to USD", () => {
        expect(fromOkx(okx.funding, okx.oi, okx.ticker)).toMatchObject({ exchange: 'OKX', price: 3001, funding8h: 0.00005, openInterestUsd: 100000 * 3001, volume24hUsd: 200000 * 3001 });
    });

    it("reads Bybit, including negative funding", () => {
        expect(fromBybit(bybit)).toMatchObject({ exchange: 'Bybit', price: 2999.9, funding8h: -0.00002, openInterestUsd: 1.5e9, volume24hUsd: 4e9 });
        expect(() => fromBybit({ result: { list: [] } })).toThrow();
    });

    it("summarizes Deribit options by put/call and expiry", () => {
        const s = fromDeribitOptions(options, 3000);
        expect(s).toMatchObject({ openInterestEth: 175, openInterestUsd: 525000, volume24hUsd: 1500 });
        expect(s.putCallRatio).toBeCloseTo(50 / 125);
        expect(s.topExpiries).toEqual([{ expiry: '27DEC24', openInterestEth: 150 }, { expiry: '31JAN25', openInterestEth: 25 }]);
    });
});

describe("getDerivatives", () => {
    it("averages funding over the exchanges that answered and marks the others unavailable", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('kind=future')) return json(deribitFutures);
            if (url.includes('kind=option')) return json(options);
            if (url.includes('get_index_price')) return json({ result: { index_price: 3000 } });
            if (url.includes('bybit')) return json(bybit);
            if (url.includes('okx.com')) return json({ msg: 'blocked' }, 403);
            throw new Error('Unexpected ' + url);
        });

        const d = await getDerivatives();
        expect(d.perps.map(p => [p.exchange, 'data' in p.result])).toEqual([['Deribit', true], ['OKX', false], ['Bybit', true]]);
        expect(d.averageFunding8h).toBeCloseTo((0.0001 - 0.00002) / 2);
        expect(d.totalOpenInterestUsd).toBe(6e8 + 1.5e9);
        expect('data' in d.options && d.options.data.openInterestEth).toBe(175);
    });
});
