import { NextResponse } from "next/server";
import { z } from "zod";
import { getAddress, isAddress, type Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { CHAIN_KEYS } from "@/lib/chains";
import { chainClient } from "@/lib/providers/rpc";
import { lookupEnsName, resolveEnsName } from "@/lib/ens";
import { labelFor } from "@/lib/labels";

export const dynamic = 'force-dynamic';

// POST: checks a send recipient: resolves ENS names (on Ethereum), finds the primary name for an address,
// and says whether it is a contract (sending tokens to a contract that can't handle them loses them)
export const POST = withErrorHandling(async (request: Request) => {
    const { chain, input } = await parseBody(request, z.object({ chain: z.enum(CHAIN_KEYS), input: z.string().trim().min(3).max(100) }));
    let address: Address;
    let ensName: string | null = null;
    if (isAddress(input, { strict: false })) {
        address = getAddress(input);
        ensName = await lookupEnsName(address).catch(() => null);
    }
    else {
        const resolved = await resolveEnsName(input).catch(() => null);
        if (!resolved) throw new HttpError(404, `${input} doesn't point to an address`);
        address = getAddress(resolved);
        ensName = input.toLowerCase();
    }
    const code = await chainClient(chain).getCode({ address }).catch(() => undefined);
    return NextResponse.json({ address, ensName, isContract: !!code && code !== '0x', label: labelFor(address)?.name ?? null });
});
