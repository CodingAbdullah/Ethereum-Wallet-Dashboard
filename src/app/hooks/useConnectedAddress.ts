'use client';

import { useEffect, type RefObject } from 'react';
import { useAccount } from 'wagmi';

// The connected wallet's address, or undefined when no wallet is connected
export function useConnectedAddress() {
    const { address, isConnected } = useAccount();
    return isConnected ? address : undefined;
}

// Fills an address input with the connected wallet's address.
// Only fills an empty input, so it never overwrites what the user typed.
export function usePrefillAddress(inputRef: RefObject<HTMLInputElement | null>) {
    const address = useConnectedAddress();

    useEffect(() => {
        if (address && inputRef.current && !inputRef.current.value) {
            inputRef.current.value = address;
        }
    }, [address, inputRef]);

    return address;
}
