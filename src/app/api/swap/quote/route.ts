import { NextResponse } from "next/server";
import { z } from "zod";
import { isAddress, type Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { addressSchema } from "@/lib/validation";
import { chainClient } from "@/lib/providers/rpc";
import { UNISWAP, routeAddress } from "@/lib/onchain/uniswap";
import { bestQuote, NoRouteError } from "@/lib/onchain/quote";
import type { ChainKey } from "@/lib/chains";

export const dynamic = 'force-dynamic';

const token = z.union([z.literal('native'), z.string().refine(v => isAddress(v, { strict: false }), 'Invalid token address')]);
const body = z.object({
    chain: z.enum(Object.keys(UNISWAP) as [ChainKey, ...ChainKey[]]),
    tokenIn: token,
    tokenOut: token,
    amountIn: z.string().regex(/^\d{1,78}$/, 'amountIn must be a raw whole number').refine(v => BigInt(v) > BigInt(0), 'Amount must be above 0'),
    owner: addressSchema.optional()
});

// POST: the best Uniswap v3 quote (keyless, on-chain QuoterV2) and the router's current allowance
export const POST = withErrorHandling(async (request: Request) => {
    const b = await parseBody(request, body);
    const asToken = (t: string) => t === 'native' ? routeAddress(b.chain, { kind: 'native', symbol: '', decimals: 18 }) : t as Address;
    if (b.tokenIn === 'native' && b.tokenOut === 'native') throw new HttpError(400, 'Pick two different tokens');
    if (asToken(b.tokenIn).toLowerCase() === asToken(b.tokenOut).toLowerCase()) throw new HttpError(400, 'Swapping between the native coin and its wrapped token is a wrap: use the Stake & Wrap page');
    try {
        const quote = await bestQuote(chainClient(b.chain), b.chain, asToken(b.tokenIn), asToken(b.tokenOut), BigInt(b.amountIn), b.owner as Address | undefined, b.tokenIn === 'native');
        return NextResponse.json(quote);
    }
    catch (err) {
        if (err instanceof NoRouteError) throw new HttpError(422, err.message);
        throw err;
    }
});
