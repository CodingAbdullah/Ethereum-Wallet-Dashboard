import { NextResponse } from "next/server";
import { formatEther, formatGwei, type Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { chainInfo } from "@/lib/chains";
import { chainClient } from "@/lib/providers/rpc";
import { simulateCalls } from "@/lib/onchain/simulate";
import { assessTransaction } from "@/lib/onchain/risks";
import { simulateRequest, toCall } from "@/lib/onchain/request";

export const dynamic = 'force-dynamic';

// POST: simulate a transaction (or several, in order) before the user signs it, and return the
// balance changes, a fee estimate and plain-English risk flags. Nothing is signed or sent here.
export const POST = withErrorHandling(async (request: Request) => {
    const body = await parseBody(request, simulateRequest);
    const client = chainClient(body.chain);
    const calls = body.calls.map(toCall);
    const native = chainInfo(body.chain).native;

    const [simulation, gasPrice] = await Promise.all([
        simulateCalls(client, body.from as Address, calls, native),
        client.getGasPrice().catch(() => null)
    ]);
    const flags = await assessTransaction(body.chain, calls, simulation.assetChanges, body.screen);

    const fee = simulation.gasUsed && gasPrice !== null ? {
        gasPriceGwei: Number(Number(formatGwei(gasPrice)).toFixed(3)),
        // eth_simulateV1 gas is close to what the wallet will use; L2s add a small L1 data fee on top
        estimate: Number(formatEther(BigInt(simulation.gasUsed) * gasPrice)),
        symbol: native
    } : null;

    return NextResponse.json({ simulation, flags, fee });
});
