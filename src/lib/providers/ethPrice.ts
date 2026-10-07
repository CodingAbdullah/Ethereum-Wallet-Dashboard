import { providerFetch } from "./http";
import { coingecko } from "./coingecko";

export interface EthPrice {
    usd: number;
    usd_24h_change: number;
}

// ETH/USD price with 24h change.
// Uses Coinbase Exchange's free public stats endpoint (no key, no monthly cap) so the navbar
// doesn't spend the CoinGecko Demo quota, and falls back to CoinGecko if Coinbase is unavailable.
export async function getEthPrice(): Promise<EthPrice> {
    try {
        const stats = await providerFetch<{ open: string; last: string }>('Coinbase', 'https://api.exchange.coinbase.com/products/ETH-USD/stats', { revalidate: 60 });
        const last = Number(stats.last);
        const open = Number(stats.open);
        if (!Number.isFinite(last) || last <= 0) throw new Error('Invalid Coinbase price');
        return { usd: last, usd_24h_change: open > 0 ? ((last - open) / open) * 100 : 0 };
    }
    catch {
        const data = await coingecko<{ ethereum: EthPrice }>('/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true', 300);
        return data.ethereum;
    }
}
