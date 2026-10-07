import { providerFetch } from "./http";

// DefiLlama open API (keyless). Some responses (protocols, pools) are several MB, which is over the
// Next.js data cache's 2 MB item limit, so these calls are not cached here. Callers cache the much
// smaller processed result with unstable_cache instead (see src/lib/defi.ts).
export const DEFILLAMA = {
    api: 'https://api.llama.fi',
    stablecoins: 'https://stablecoins.llama.fi',
    yields: 'https://yields.llama.fi'
} as const;

export function defillama<T>(base: keyof typeof DEFILLAMA, path: string): Promise<T> {
    return providerFetch<T>('DefiLlama', DEFILLAMA[base] + path, { revalidate: false, timeoutMs: 20000 });
}
