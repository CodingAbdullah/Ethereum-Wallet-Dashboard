import { providerFetch, ProviderError } from "./http";
import type { Network } from "../validation";

// Etherscan API V2 on the free plan (5 calls/second, 100,000 calls/day)
const ETHERSCAN_URL = 'https://api.etherscan.io/v2/api';

export const CHAIN_IDS: Record<Network, number> = {
    eth: 1,
    sepolia: 11155111,
    hoodi: 560048
};

interface EtherscanResponse<T> {
    status: string;
    message: string;
    result: T;
}

// Calls an Etherscan module/action and returns the full response ({ status, message, result })
// "No transactions found" is returned as an empty result instead of an error
export async function etherscan<T>(params: Record<string, string | number>, network: Network = 'eth', revalidate: number = 60): Promise<EtherscanResponse<T>> {
    const query = new URLSearchParams({ chainid: String(CHAIN_IDS[network]) });
    for (const [key, value] of Object.entries(params)) query.set(key, String(value));
    query.set('apikey', process.env.ETHERSCAN_API_KEY ?? '');

    const data = await providerFetch<EtherscanResponse<T>>('Etherscan', ETHERSCAN_URL + '?' + query.toString(), { revalidate });

    if (data.status === '0' && !/no (transactions|records) found/i.test(data.message)) {
        const detail = typeof data.result === 'string' ? data.result : data.message;
        throw new ProviderError('Etherscan', /key|rate|plan|pro/i.test(detail) ? 403 : 502, 'Etherscan error: ' + detail);
    }

    if (data.status === '0') return { ...data, result: [] as unknown as T };
    return data;
}
