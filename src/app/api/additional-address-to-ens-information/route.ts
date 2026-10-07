import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveEnsName } from "@/lib/ens";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { ensNameSchema } from "@/lib/validation";

const bodySchema = z.object({ ensName: ensNameSchema });

// Address an ENS name resolves to (forward resolution over free RPC)
export const POST = withErrorHandling(async (request: Request) => {
    const { ensName } = await parseBody(request, bodySchema);
    const owner = await resolveEnsName(ensName);

    if (!owner) return NextResponse.json({ error: 'ENS name does not resolve to an address' }, { status: 404 });
    return NextResponse.json({ results: [{ owner }] });
});
