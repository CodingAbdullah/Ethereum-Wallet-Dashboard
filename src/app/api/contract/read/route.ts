import { NextResponse } from "next/server";
import { z } from "zod";
import type { AbiFunction, Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { CHAIN_KEYS } from "@/lib/chains";
import { addressSchema } from "@/lib/validation";
import { chainClient } from "@/lib/providers/rpc";
import { formatResult, InputError, isRead, parseArgs } from "@/lib/onchain/abiInput";

export const dynamic = 'force-dynamic';

const body = z.object({
    chain: z.enum(CHAIN_KEYS),
    address: addressSchema,
    fn: z.object({ type: z.literal('function'), name: z.string().max(200), inputs: z.array(z.any()).max(20), outputs: z.array(z.any()).max(50), stateMutability: z.string() }).passthrough(),
    args: z.array(z.string().max(10_000)).max(20)
});

// POST: calls one read-only (view/pure) function and returns the result as text
export const POST = withErrorHandling(async (request: Request) => {
    const b = await parseBody(request, body);
    const fn = b.fn as unknown as AbiFunction;
    if (!isRead(fn)) throw new HttpError(400, 'Only view and pure functions can be read; write functions go through the transaction preview');
    let args: unknown[];
    try { args = parseArgs(fn, b.args); }
    catch (err) { if (err instanceof InputError) throw new HttpError(400, err.message); throw err; }
    try {
        const result = await chainClient(b.chain).readContract({ address: b.address as Address, abi: [fn], functionName: fn.name, args } as never);
        return NextResponse.json({ result: formatResult(result) });
    }
    catch (err) {
        const message = (err as { shortMessage?: string }).shortMessage ?? 'The call failed';
        throw new HttpError(422, message);
    }
});
