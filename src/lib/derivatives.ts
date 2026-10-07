import { unstable_cache } from "next/cache";
import { providerFetch } from "./providers/http";
import type { Section } from "./defi";

// ETH derivatives from public, keyless exchange APIs: perpetual funding rates, open interest and
// volume (Deribit, OKX, Bybit) and the options market (Deribit). Some exchanges block requests from
// certain regions, so each one loads on its own and a blocked exchange is simply marked unavailable.

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

export interface PerpMarket {
    exchange: string;
    market: string;
    price: number | null;
    funding8h: number | null;           // as a fraction, e.g. 0.0001 = 0.01% per 8 hours
    fundingAnnualized: number | null;   // funding8h x 3 x 365
    openInterestUsd: number | null;
    volume24hUsd: number | null;
}

export interface OptionsSummary {
    openInterestEth: number;
    openInterestUsd: number | null;
    volume24hUsd: number;
    putCallRatio: number | null;        // put open interest / call open interest
    topExpiries: { expiry: string; openInterestEth: number }[];
}

const annualize = (funding8h: number | null) => funding8h === null ? null : funding8h * 3 * 365;

export function fromDeribitFutures(data: unknown): PerpMarket {
    const perp = list(obj(data).result).map(obj).find(r => r.instrument_name === 'ETH-PERPETUAL');
    if (!perp) throw new Error('No ETH-PERPETUAL in Deribit response');
    const funding8h = num(perp.funding_8h);
    return {
        exchange: 'Deribit', market: 'ETH-PERPETUAL (inverse)',
        price: num(perp.mark_price), funding8h, fundingAnnualized: annualize(funding8h),
        openInterestUsd: num(perp.open_interest),        // inverse contracts are 1 USD each
        volume24hUsd: num(perp.volume_usd)
    };
}

export function fromOkx(funding: unknown, openInterest: unknown, ticker: unknown): PerpMarket {
    const f = obj(list(obj(funding).data)[0]);
    const oi = obj(list(obj(openInterest).data)[0]);
    const t = obj(list(obj(ticker).data)[0]);
    const price = num(t.last);
    const funding8h = num(f.fundingRate);
    const oiCcy = num(oi.oiCcy);
    const volCcy = num(t.volCcy24h);
    return {
        exchange: 'OKX', market: 'ETH-USDT-SWAP',
        price, funding8h, fundingAnnualized: annualize(funding8h),
        openInterestUsd: num(oi.oiUsd) ?? (oiCcy !== null && price !== null ? oiCcy * price : null),
        volume24hUsd: volCcy !== null && price !== null ? volCcy * price : null
    };
}

export function fromBybit(data: unknown): PerpMarket {
    const t = obj(list(obj(obj(data).result).list)[0]);
    if (Object.keys(t).length === 0) throw new Error('No ETHUSDT in Bybit response');
    const funding8h = num(t.fundingRate);
    return {
        exchange: 'Bybit', market: 'ETHUSDT',
        price: num(t.lastPrice), funding8h, fundingAnnualized: annualize(funding8h),
        openInterestUsd: num(t.openInterestValue),
        volume24hUsd: num(t.turnover24h)
    };
}

// Deribit option names look like ETH-27DEC24-4000-C
export function fromDeribitOptions(data: unknown, indexPrice: number | null): OptionsSummary {
    let calls = 0; let puts = 0; let volumeUsd = 0;
    const byExpiry = new Map<string, number>();
    for (const raw of list(obj(data).result)) {
        const o = obj(raw);
        const name = typeof o.instrument_name === 'string' ? o.instrument_name : '';
        const [, expiry, , kind] = name.split('-');
        const oi = num(o.open_interest) ?? 0;
        if (kind === 'C') calls += oi; else if (kind === 'P') puts += oi; else continue;
        volumeUsd += num(o.volume_usd) ?? 0;
        if (expiry) byExpiry.set(expiry, (byExpiry.get(expiry) ?? 0) + oi);
    }
    const total = calls + puts;
    return {
        openInterestEth: total,
        openInterestUsd: indexPrice !== null ? total * indexPrice : null,
        volume24hUsd: volumeUsd,
        putCallRatio: calls > 0 ? puts / calls : null,
        topExpiries: [...byExpiry.entries()].map(([expiry, openInterestEth]) => ({ expiry, openInterestEth })).sort((a, b) => b.openInterestEth - a.openInterestEth).slice(0, 6)
    };
}

const get = (provider: string, url: string) => providerFetch<unknown>(provider, url, { revalidate: false, timeoutMs: 15000 });

const deribitPerp = unstable_cache(async () => fromDeribitFutures(await get('Deribit', 'https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=future')), ['derivatives', 'deribit-perp'], { revalidate: 300 });
const okxPerp = unstable_cache(async () => {
    const [funding, oi, ticker] = await Promise.all([
        get('OKX', 'https://www.okx.com/api/v5/public/funding-rate?instId=ETH-USDT-SWAP'),
        get('OKX', 'https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=ETH-USDT-SWAP'),
        get('OKX', 'https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT-SWAP')
    ]);
    return fromOkx(funding, oi, ticker);
}, ['derivatives', 'okx-perp'], { revalidate: 300 });
const bybitPerp = unstable_cache(async () => fromBybit(await get('Bybit', 'https://api.bybit.com/v5/market/tickers?category=linear&symbol=ETHUSDT')), ['derivatives', 'bybit-perp'], { revalidate: 300 });
const deribitOptions = unstable_cache(async () => {
    const [options, index] = await Promise.all([
        get('Deribit', 'https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=option'),
        get('Deribit', 'https://www.deribit.com/api/v2/public/get_index_price?index_name=eth_usd')
    ]);
    return fromDeribitOptions(options, num(obj(obj(index).result).index_price));
}, ['derivatives', 'deribit-options'], { revalidate: 600 });

async function section<T>(load: () => Promise<T>): Promise<Section<T>> {
    try { return { data: await load() }; }
    catch { return { error: 'Unavailable right now (the exchange may block this server\'s region)' }; }
}

export async function getDerivatives() {
    const [deribit, okx, bybit, options] = await Promise.all([section(deribitPerp), section(okxPerp), section(bybitPerp), section(deribitOptions)]);
    const perps = [{ exchange: 'Deribit', result: deribit }, { exchange: 'OKX', result: okx }, { exchange: 'Bybit', result: bybit }];
    const markets = perps.flatMap(p => 'data' in p.result ? [p.result.data] : []);
    const withFunding = markets.filter(m => m.funding8h !== null);
    return {
        perps,
        averageFunding8h: withFunding.length ? withFunding.reduce((s, m) => s + m.funding8h!, 0) / withFunding.length : null,
        totalOpenInterestUsd: markets.reduce((s, m) => s + (m.openInterestUsd ?? 0), 0) || null,
        options
    };
}

export type Derivatives = Awaited<ReturnType<typeof getDerivatives>>;
