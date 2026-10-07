import { Redis } from "@upstash/redis";
import { generateSiweNonce } from "viem/siwe";

// Single-use sign-in nonces that expire after a few minutes.
// Stored in Upstash Redis when configured (shared by every server instance), in memory otherwise.

export const NONCE_TTL_SECONDS = 5 * 60;

export interface NonceStore {
    create(): Promise<string>;
    // Returns true once for a valid, unexpired nonce, then forgets it
    consume(nonce: string): Promise<boolean>;
}

export function createMemoryNonceStore(ttlMs = NONCE_TTL_SECONDS * 1000, now: () => number = Date.now): NonceStore {
    const nonces = new Map<string, number>();

    return {
        async create() {
            const time = now();
            if (nonces.size > 10_000) {
                for (const [n, expiresAt] of nonces) if (expiresAt <= time) nonces.delete(n);
            }
            const nonce = generateSiweNonce();
            nonces.set(nonce, time + ttlMs);
            return nonce;
        },
        async consume(nonce: string) {
            const expiresAt = nonces.get(nonce);
            nonces.delete(nonce);
            return expiresAt !== undefined && expiresAt > now();
        }
    };
}

function createUpstashNonceStore(url: string, token: string): NonceStore {
    const redis = new Redis({ url, token });
    const key = (nonce: string) => 'eth-dashboard:siwe-nonce:' + nonce;

    return {
        async create() {
            const nonce = generateSiweNonce();
            await redis.set(key(nonce), 1, { ex: NONCE_TTL_SECONDS });
            return nonce;
        },
        async consume(nonce: string) {
            // DEL returns 1 only for the first caller, so a nonce can't be replayed
            return (await redis.del(key(nonce))) === 1;
        }
    };
}

export function createNonceStore(env: Record<string, string | undefined> = process.env): NonceStore {
    const url = env.UPSTASH_REDIS_REST_URL;
    const token = env.UPSTASH_REDIS_REST_TOKEN;
    return url && token ? createUpstashNonceStore(url, token) : createMemoryNonceStore();
}
