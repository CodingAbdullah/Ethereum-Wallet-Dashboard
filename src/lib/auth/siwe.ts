import { getAddress, type Address, type PublicClient } from "viem";
import { parseSiweMessage } from "viem/siwe";
import type { NonceStore } from "./nonce";
import { HttpError } from "../api/errors";
import { CHAINS } from "../chains";

// Server-side Sign-In with Ethereum (EIP-4361) check

// Every network the dashboard supports (src/lib/chains.ts)
export const SIWE_CHAIN_IDS: number[] = Object.values(CHAINS).map(c => c.chainId);

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
    // Client for the message's chain, used to verify the signature, including smart-contract wallets (ERC-1271 / ERC-6492)
    clientFor: (chainId: number) => Pick<PublicClient, 'verifySiweMessage'>;
    now?: Date;
}

export async function verifySignIn({ message, signature, host, nonces, clientFor, now = new Date() }: VerifySiweParams): Promise<{ address: Address; chainId: number }> {
    const fields = parseSiweMessage(message);

    if (!fields.address || !fields.nonce || !fields.domain || !fields.chainId) throw new SiweError('Malformed sign-in message');
    if (fields.domain !== host) throw new SiweError('Sign-in message is for a different site');
    if (!SIWE_CHAIN_IDS.includes(fields.chainId)) throw new SiweError('Unsupported network');
    if (!fields.issuedAt || Math.abs(now.getTime() - fields.issuedAt.getTime()) > 10 * 60 * 1000) throw new SiweError('Sign-in message is too old');
    if (fields.expirationTime && fields.expirationTime <= now) throw new SiweError('Sign-in message has expired');
    if (fields.notBefore && fields.notBefore > now) throw new SiweError('Sign-in message is not valid yet');

    // Consume the nonce before checking the signature, so a captured message can only be tried once
    if (!(await nonces.consume(fields.nonce))) throw new SiweError('Sign-in request expired, please try again');

    const valid = await clientFor(fields.chainId).verifySiweMessage({ message, signature, domain: host, nonce: fields.nonce, time: now });
    if (!valid) throw new SiweError('Invalid signature');

    return { address: getAddress(fields.address), chainId: fields.chainId };
}
