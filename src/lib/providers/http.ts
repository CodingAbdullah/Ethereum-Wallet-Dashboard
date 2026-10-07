// Shared HTTP helper used by every provider client.
// Adds timeouts, one retry on rate limits / server errors, Next.js data caching and typed errors.

export class ProviderError extends Error {
    constructor(
        public readonly provider: string,
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = 'ProviderError';
    }

    // 401/402/403 from a provider almost always means a missing key or an endpoint outside the free plan
    get isPlanRestricted(): boolean {
        return this.status === 401 || this.status === 402 || this.status === 403;
    }
}

export interface ProviderFetchOptions {
    headers?: Record<string, string | undefined>;
    method?: 'GET' | 'POST';
    body?: string;
    revalidate?: number | false; // Seconds to cache the response in the Next.js data cache, false = no cache
    timeoutMs?: number;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export async function providerFetch<T>(provider: string, url: string, options: ProviderFetchOptions = {}): Promise<T> {
    const { headers = {}, method = 'GET', body, revalidate = 60, timeoutMs = 15000 } = options;

    // Drop headers whose value is undefined (e.g. optional API keys)
    const cleanHeaders: Record<string, string> = { accept: 'application/json' };
    for (const [key, value] of Object.entries(headers)) {
        if (value) cleanHeaders[key] = value;
    }

    const init: RequestInit & { next?: { revalidate: number } } = {
        method,
        headers: cleanHeaders,
        body
    };

    if (revalidate === false) init.cache = 'no-store';
    else init.next = { revalidate };

    for (let attempt = 0; attempt < 2; attempt++) {
        let response: Response;
        try {
            response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
        }
        catch (err) {
            if (attempt === 0) continue;
            throw new ProviderError(provider, 504, `${provider} request failed: ${(err as Error).message}`);
        }

        if (response.ok) return response.json() as Promise<T>;

        if (attempt === 0 && RETRYABLE_STATUS.has(response.status)) {
            await new Promise(resolve => setTimeout(resolve, 750));
            continue;
        }

        throw new ProviderError(provider, response.status, `${provider} responded with ${response.status}`);
    }

    // Unreachable, the loop either returns or throws
    throw new ProviderError(provider, 500, `${provider} request failed`);
}
