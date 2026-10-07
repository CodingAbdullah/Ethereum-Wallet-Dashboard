import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { addressSchema, networkSchema } from "@/lib/validation";
import { getTokenRisks, MAX_RISK_BATCH } from "@/lib/tokenRisk";
import { hasMarketValue } from "@/lib/chains";

const body = z.object({
    chain: networkSchema,
    addresses: z.array(addressSchema).min(1).max(MAX_RISK_BATCH)
});

// POST: GoPlus risk checks for up to 30 tokens on one chain (cached an hour). Testnets aren't covered.
export const POST = withErrorHandling(async (request: Request) => {
    const { chain, addresses } = await parseBody(request, body);
    if (!hasMarketValue(chain)) return NextResponse.json({});
    return NextResponse.json(await getTokenRisks(chain, addresses));
});
