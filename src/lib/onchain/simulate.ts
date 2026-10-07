import { formatUnits, type Address, type Hex, type PublicClient } from "viem";

// Simulates one or more transactions before the user signs them, with eth_simulateV1 (viem's
// simulateCalls). Calls run in order on top of the latest block, so "approve, then swap" works.
// Balance changes come from simulating balanceOf before and after (traceAssetChanges).
// RPCs without eth_simulateV1 fall back to eth_estimateGas: we can still say whether it would
// succeed, but not show balance changes.

export interface TxCall { to: Address; data?: Hex; value?: bigint }

export interface AssetChange {
    token: Address | 'native';
    symbol: string;
    decimals: number;
    diff: string;           // raw amount, signed, as a decimal string
    amount: number;         // diff in whole tokens (for display)
}

export interface CallOutcome { ok: boolean; gasUsed: string | null; error: string | null }

export interface Simulation {
    supported: boolean;     // false when the RPC has no eth_simulateV1 (no balance changes)
    ok: boolean;
    calls: CallOutcome[];
    assetChanges: AssetChange[];
    gasUsed: string | null;
    error: string | null;
}

const NATIVE_PLACEHOLDER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

// Short, readable error text from a viem error (revert reason when there is one)
export function errorMessage(err: unknown): string {
    const e = err as { shortMessage?: string; details?: string; message?: string; cause?: unknown };
    const reason = (e?.cause as { reason?: string } | undefined)?.reason;
    const text = reason ? `Reverted: ${reason}` : e?.shortMessage || e?.details || e?.message || 'Simulation failed';
    return text.split('\n')[0].slice(0, 300);
}

const isUnsupported = (err: unknown) => /eth_simulateV1|method not found|not supported|does not exist|unknown method|-32601/i.test(String((err as Error)?.message ?? err));

export async function simulateCalls(client: PublicClient, from: Address, calls: TxCall[], nativeSymbol = 'ETH'): Promise<Simulation> {
    try {
        const result = await client.simulateCalls({ account: from, calls, traceAssetChanges: true });
        const outcomes: CallOutcome[] = result.results.map(r => ({
            ok: r.status === 'success',
            gasUsed: r.gasUsed?.toString() ?? null,
            error: r.status === 'success' ? null : errorMessage(r.error)
        }));
        const failed = outcomes.find(o => !o.ok);
        const assetChanges: AssetChange[] = result.assetChanges
            .filter(c => c.value.diff !== BigInt(0))
            .map(c => {
                const native = c.token.address.toLowerCase() === NATIVE_PLACEHOLDER;
                const decimals = c.token.decimals ?? 18;
                return {
                    token: native ? 'native' : c.token.address,
                    symbol: native ? nativeSymbol : c.token.symbol ?? '?',
                    decimals,
                    diff: c.value.diff.toString(),
                    amount: Number(formatUnits(c.value.diff, decimals))
                };
            });
        return {
            supported: true,
            ok: !failed,
            calls: outcomes,
            assetChanges,
            gasUsed: outcomes.reduce((sum, o) => sum + BigInt(o.gasUsed ?? 0), BigInt(0)).toString(),
            error: failed?.error ?? null
        };
    }
    catch (err) {
        if (!isUnsupported(err)) {
            // The whole simulation was rejected (e.g. not enough ETH to pay): report it as a failure
            return { supported: true, ok: false, calls: calls.map(() => ({ ok: false, gasUsed: null, error: null })), assetChanges: [], gasUsed: null, error: errorMessage(err) };
        }
    }

    // Fallback: estimate gas for the first call only (later calls may depend on it)
    try {
        const gas = await client.estimateGas({ account: from, to: calls[0].to, data: calls[0].data, value: calls[0].value });
        return {
            supported: false, ok: true,
            calls: calls.map((_, i) => ({ ok: true, gasUsed: i === 0 ? gas.toString() : null, error: null })),
            assetChanges: [], gasUsed: gas.toString(), error: null
        };
    }
    catch (err) {
        return { supported: false, ok: false, calls: calls.map((_, i) => ({ ok: i !== 0, gasUsed: null, error: i === 0 ? errorMessage(err) : null })), assetChanges: [], gasUsed: null, error: errorMessage(err) };
    }
}
