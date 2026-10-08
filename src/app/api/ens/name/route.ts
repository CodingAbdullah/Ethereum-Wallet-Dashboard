import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { chainClient } from "@/lib/providers/rpc";
import { getEnsNameStatus } from "@/lib/onchain/ensStatus";

export const dynamic = 'force-dynamic';

// POST: an ENS name's availability, owner, expiry, price, records, and whether registration is open here
export const POST = withErrorHandling(async (request: Request) => {
    const { name } = await parseBody(request, z.object({ name: z.string().trim().min(1).max(255) }));
    try {
        return NextResponse.json(await getEnsNameStatus(chainClient('eth'), name));
    }
    catch (err) {
        if (err instanceof Error && /normalize|disallowed|illegal|invalid/i.test(err.message)) throw new HttpError(400, 'That is not a valid ENS name');
        throw err;
    }
});
