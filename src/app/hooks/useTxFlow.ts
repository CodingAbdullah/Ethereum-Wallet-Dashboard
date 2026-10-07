'use client';

import { useCallback, useRef, useState } from 'react';
import { useAccount, useConfig, useSendTransaction, useSwitchChain } from 'wagmi';
import { getConnectorClient, waitForTransactionReceipt } from 'wagmi/actions';
import { waitForTransactionReceipt as waitWithClient } from 'viem/actions';
import type { Hex } from 'viem';
import type { Config } from 'wagmi';
import { CHAINS, type ChainKey } from '@/lib/chains';
import type { CallJson } from '@/lib/onchain/request';
import type { Simulation } from '@/lib/onchain/simulate';
import type { RiskFlag } from '@/lib/onchain/risks';

// Every on-chain action goes through the same steps:
// 1. simulate (server, eth_simulateV1) → 2. preview → 3. the user signs in their own wallet (wagmi)
// → 4. wait for each transaction to be mined → 5. report the result.
// The app never sees a private key: the wallet signs and sends.

export interface TxPlan {
    chain: ChainKey;
    title: string;              // e.g. "Revoke USDC approval for Uniswap"
    description?: string;
    calls: CallJson[];          // sent one after another
    screen?: string[];          // extra addresses for the security check (e.g. a send recipient)
}

export interface Preview { simulation: Simulation; flags: RiskFlag[]; fee: { gasPriceGwei: number; estimate: number; symbol: string } | null }
export interface SentTx { hash: Hex; status: 'pending' | 'success' | 'reverted' }

export type FlowState =
    | { step: 'idle' }
    | { step: 'simulating' }
    | { step: 'preview'; preview: Preview }
    | { step: 'signing'; preview: Preview; index: number; sent: SentTx[] }
    | { step: 'done'; preview: Preview; sent: SentTx[] }
    | { step: 'failed'; preview: Preview | null; sent: SentTx[]; error: string };

// Wallet errors as one short sentence; "the user said no" is not a failure
export function walletError(err: unknown): { rejected: boolean; message: string } {
    const e = err as { name?: string; shortMessage?: string; message?: string; code?: number; cause?: { code?: number } };
    const rejected = e?.name === 'UserRejectedRequestError' || e?.code === 4001 || e?.cause?.code === 4001 || /user (rejected|denied)/i.test(e?.message ?? '');
    return { rejected, message: rejected ? 'You cancelled in your wallet.' : (e?.shortMessage || e?.message || 'The wallet returned an error').split('\n')[0] };
}

// Waits for the receipt through the connected wallet's own RPC first: it is the node that broadcast the
// transaction, so it sees it soonest (and it is the only one that can see transactions on a local test chain).
// Falls back to the app's public RPC for the chain.
async function waitForReceipt(config: Config, hash: Hex, chainId: number) {
    try {
        const client = await getConnectorClient(config, { chainId });
        return await waitWithClient(client, { hash, pollingInterval: 2_000, timeout: 5 * 60_000 });
    }
    catch {
        return waitForTransactionReceipt(config, { hash, chainId });
    }
}

export function useTxFlow(onDone?: (sent: SentTx[]) => void) {
    const config = useConfig();
    const { address, chainId } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const [state, setState] = useState<FlowState>({ step: 'idle' });
    const running = useRef(false);

    const simulate = useCallback(async (plan: TxPlan) => {
        if (!address) return;
        setState({ step: 'simulating' });
        try {
            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chain: plan.chain, from: address, calls: plan.calls, screen: plan.screen })
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(body.issues?.join(', ') || body.error || 'The simulation failed');
            setState({ step: 'preview', preview: body as Preview });
        }
        catch (err) {
            setState({ step: 'failed', preview: null, sent: [], error: err instanceof Error ? err.message : 'The simulation failed' });
        }
    }, [address]);

    const confirm = useCallback(async (plan: TxPlan, preview: Preview) => {
        if (running.current) return;
        running.current = true;
        const target = CHAINS[plan.chain].chainId;
        const sent: SentTx[] = [];
        try {
            if (chainId !== target) await switchChainAsync({ chainId: target });
            for (let i = 0; i < plan.calls.length; i++) {
                setState({ step: 'signing', preview, index: i, sent: [...sent] });
                const call = plan.calls[i];
                const hash = await sendTransactionAsync({ to: call.to as Hex, data: call.data as Hex | undefined, value: call.value ? BigInt(call.value) : undefined, chainId: target });
                sent.push({ hash, status: 'pending' });
                setState({ step: 'signing', preview, index: i, sent: [...sent] });
                const receipt = await waitForReceipt(config, hash, target);
                sent[i] = { hash, status: receipt.status === 'success' ? 'success' : 'reverted' };
                if (receipt.status !== 'success') {
                    setState({ step: 'failed', preview, sent: [...sent], error: 'The transaction was mined but failed (reverted). No changes were made by it.' });
                    return;
                }
            }
            setState({ step: 'done', preview, sent: [...sent] });
            onDone?.(sent);
        }
        catch (err) {
            const { rejected, message } = walletError(err);
            if (rejected && sent.length === 0) setState({ step: 'preview', preview });
            else setState({ step: 'failed', preview, sent: [...sent], error: message });
        }
        finally {
            running.current = false;
        }
    }, [chainId, config, onDone, sendTransactionAsync, switchChainAsync]);

    const reset = useCallback(() => setState({ step: 'idle' }), []);
    return { state, simulate, confirm, reset, address, walletChainId: chainId };
}
