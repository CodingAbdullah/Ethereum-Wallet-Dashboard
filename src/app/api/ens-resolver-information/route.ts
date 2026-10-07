import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnsHoldings } from "@/lib/ensHoldings";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressSchema, ensNameSchema } from "@/lib/validation";

const bodySchema = z.object({ address: z.union([addressSchema, ensNameSchema]) });

// .eth names owned by an address or ENS name, with expiry details (Moralis free plan + free RPC)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, bodySchema);
    const results = await getEnsHoldings(address);

    if (!results) return NextResponse.json({ error: 'Could not resolve ENS name to an address' }, { status: 400 });
    return NextResponse.json({ results });
});
