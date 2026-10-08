import { NextResponse } from "next/server";
import { z } from "zod";
import { isHex, type Address, type Hex } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { addressSchema } from "@/lib/validation";
import { chainClient } from "@/lib/providers/rpc";
import { getCommitment } from "@/lib/onchain/ensStatus";

export const dynamic = 'force-dynamic';

const body = z.object({
    label: z.string().min(3).max(100),
    owner: addressSchema,
    years: z.number().int().min(1).max(10),
    secret: z.string().refine(v => isHex(v) && v.length === 66, 'Secret must be 32 bytes'),
    setPrimary: z.boolean()
});

// POST: the registration commitment, computed by the ENS controller itself so it always matches what it checks
export const POST = withErrorHandling(async (request: Request) => {
    const b = await parseBody(request, body);
    return NextResponse.json(await getCommitment(chainClient('eth'), { ...b, owner: b.owner as Address, secret: b.secret as Hex }));
});
