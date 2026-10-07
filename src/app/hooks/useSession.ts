'use client';

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { isAddressEqual } from 'viem';
import { createSiweMessage } from 'viem/siwe';
import { useAccount, useSignMessage } from 'wagmi';

// Sign-In with Ethereum on the client: asks the connected wallet to sign a one-time message,
// and the server answers with an httpOnly session cookie.

export interface SessionInfo {
    address: `0x${string}` | null;
    authEnabled: boolean;
    accountsEnabled: boolean;
}

const SIWE_CHAIN_IDS = [1, 11155111, 560048];

async function fetchSession(url: string): Promise<SessionInfo> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not load the session');
    return response.json();
}

async function errorMessage(response: Response, fallback: string) {
    try {
        return (await response.json()).error ?? fallback;
    }
    catch {
        return fallback;
    }
}

export function useSession() {
    const { address, chainId, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { data, mutate, isLoading } = useSWR('/api/auth/session', fetchSession);
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState<string>();

    const signOut = useCallback(async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        await mutate();
    }, [mutate]);

    const signIn = useCallback(async () => {
        if (!address) return;
        setSigningIn(true);
        setError(undefined);
        try {
            const nonceResponse = await fetch('/api/auth/nonce');
            if (!nonceResponse.ok) throw new Error(await errorMessage(nonceResponse, 'Sign-in is unavailable'));
            const { nonce } = await nonceResponse.json();

            const message = createSiweMessage({
                address,
                chainId: chainId && SIWE_CHAIN_IDS.includes(chainId) ? chainId : 1,
                domain: window.location.host,
                uri: window.location.origin,
                version: '1',
                statement: 'Sign in to Ethereum Dashboard. This does not send a transaction or cost gas.',
                nonce,
                issuedAt: new Date(),
                expirationTime: new Date(Date.now() + 10 * 60 * 1000)
            });
            const signature = await signMessageAsync({ message });

            const verifyResponse = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, signature })
            });
            if (!verifyResponse.ok) throw new Error(await errorMessage(verifyResponse, 'Sign-in failed'));
            await mutate();
        }
        catch (err) {
            const text = err instanceof Error ? err.message : 'Sign-in failed';
            setError(/reject|denied/i.test(text) ? 'Signature request was rejected' : text);
        }
        finally {
            setSigningIn(false);
        }
    }, [address, chainId, signMessageAsync, mutate]);

    // A session belongs to one wallet: end it if the user switches accounts or disconnects
    const sessionAddress = data?.address;
    useEffect(() => {
        if (!sessionAddress) return;
        if (isConnected && address && !isAddressEqual(address, sessionAddress)) signOut();
    }, [sessionAddress, address, isConnected, signOut]);

    return {
        session: data,
        isSignedIn: !!sessionAddress,
        isLoading,
        signingIn,
        error,
        signIn,
        signOut
    };
}
