import { describe, expect, it } from "vitest";
import { isAddressEqual, recoverMessageAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createSiweMessage, parseSiweMessage } from "viem/siwe";
import { createMemoryNonceStore } from "./nonce";
import { verifySignIn } from "./siwe";

const account = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const HOST = 'ethereumdashboard.dev';
const NOW = new Date('2026-10-07T12:00:00Z');

// Checks EOA signatures locally; the real route uses an RPC client so smart wallets work too
const client = {
    async verifySiweMessage({ message, signature }: { message: string; signature: `0x${string}` }) {
        const { address } = parseSiweMessage(message);
        return !!address && isAddressEqual(await recoverMessageAddress({ message, signature }), address);
    }
};

async function signIn(overrides: Partial<Parameters<typeof createSiweMessage>[0]> = {}) {
    const nonces = createMemoryNonceStore();
    const nonce = await nonces.create();
    const message = createSiweMessage({
        address: account.address,
        chainId: 1,
        domain: HOST,
        nonce,
        uri: 'https://' + HOST,
        version: '1',
        issuedAt: NOW,
        ...overrides
    });
    const signature = await account.signMessage({ message });
    return { nonces, message, signature };
}

describe("verifySignIn", () => {
    it("accepts a valid signed message and returns the address", async () => {
        const { nonces, message, signature } = await signIn();
        await expect(verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW }))
            .resolves.toEqual({ address: account.address, chainId: 1 });
    });

    it("rejects a replayed message", async () => {
        const { nonces, message, signature } = await signIn();
        await verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW });
        await expect(verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW })).rejects.toThrow('expired');
    });

    it("rejects a message for another site", async () => {
        const { nonces, message, signature } = await signIn({ domain: 'evil.example' });
        await expect(verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW })).rejects.toThrow('different site');
    });

    it("rejects a signature from another account", async () => {
        const { nonces, message } = await signIn();
        const other = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a');
        const signature = await other.signMessage({ message });
        await expect(verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW })).rejects.toThrow('Invalid signature');
    });

    it("rejects unknown nonces, old messages and unsupported chains", async () => {
        const { message, signature } = await signIn();
        await expect(verifySignIn({ message, signature, host: HOST, nonces: createMemoryNonceStore(), client, now: NOW })).rejects.toThrow('expired');

        const old = await signIn({ issuedAt: new Date(NOW.getTime() - 60 * 60 * 1000) });
        await expect(verifySignIn({ ...old, host: HOST, client, now: NOW })).rejects.toThrow('too old');

        const l2 = await signIn({ chainId: 8453 });
        await expect(verifySignIn({ ...l2, host: HOST, client, now: NOW })).rejects.toThrow('Unsupported network');
    });

    it("returns 401 errors", async () => {
        const { nonces, message, signature } = await signIn({ domain: 'evil.example' });
        await expect(verifySignIn({ message, signature, host: HOST, nonces, client, now: NOW })).rejects.toMatchObject({ status: 401 });
    });
});
