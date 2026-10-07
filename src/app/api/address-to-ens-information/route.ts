import { NextResponse } from "next/server";
import { getAddress } from "viem";
import { lookupEnsName } from "@/lib/ens";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Primary ENS name for an address (reverse resolution over free RPC)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const name = await lookupEnsName(getAddress(address));

    if (!name) return NextResponse.json({ error: 'No primary ENS name set for this address' }, { status: 404 });
    return NextResponse.json({ name });
});
