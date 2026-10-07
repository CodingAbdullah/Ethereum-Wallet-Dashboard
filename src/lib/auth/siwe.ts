import { getAddress, type Address, type PublicClient } from "viem";
import { parseSiweMessage } from "viem/siwe";
import type { NonceStore } from "./nonce";
import { HttpError } from "../api/errors";

// Server-side Sign-In with Ethereum (EIP-4361) check

export const SIWE_CHAIN_IDS = [1, 11155111, 560048] as const; // mainnet, Sepolia, Hoodi

export class SiweError extends HttpError {
    constructor(message: string) {
        super(401, message);
    }
}

export interface VerifySiweParams {
    message: string;
    signature: `0x${string}`;
    // The host the request was sent to; the message must be for this site
    host: string;
    nonces: NonceStore;
    // Used to verify the signature, including smart-contract wallets (ERC-1271 / ERC-6492)
    client: Pick<PublicClient, 'verifySiweMessage'>;
    now?: Date;
}

export async function verifySignIn({ message, signature, host, nonces, client, now = new Date() }: VerifySiweParams): Promise<{ address: Address; chainId: number }> {
    const fields = parseSiweMessage(message);

    if (!fields.address || !fields.nonce || !fields.domain || !fields.chainId) throw new SiweError('Malformed sign-in message');
    if (fields.domain !== host) throw new SiweError('Sign-in message is for a different site');
    if (!(SIWE_CHAIN_IDS as readonly number[]).includes(fields.chainId)) throw new SiweError('Unsupported network');
    if (!fields.issuedAt || Math.abs(now.getTime() - fields.issuedAt.getTime()) > 10 * 60 * 1000) throw new SiweError('Sign-in message is too old');
    if (fields.expirationTime && fields.expirationTime <= now) throw new SiweError('Sign-in message has expired');
    if (fields.notBefore && fields.notBefore > now) throw new SiweError('Sign-in message is not valid yet');

    // Consume the nonce before checking the signature, so a captured message can only be tried once
    if (!(await nonces.consume(fields.nonce))) throw new SiweError('Sign-in request expired, please try again');

    const valid = await client.verifySiweMessage({ message, signature, domain: host, nonce: fields.nonce, time: now });
    if (!valid) throw new SiweError('Invalid signature');

    return { address: getAddress(fields.address), chainId: fields.chainId };
}
