import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { ensNameSchema } from "@/lib/validation";
import { resolveEnsName } from "@/lib/ens";

// GET ?name=vitalik.eth: the address an ENS name points to (free RPC), for global search
export const GET = withErrorHandling(async (request: Request) => {
    const name = ensNameSchema.parse(new URL(request.url).searchParams.get('name') ?? '');
    const address = await resolveEnsName(name);
    if (!address) throw new HttpError(404, `${name} doesn't point to an address`);
    return NextResponse.json({ name, address }, { headers: { 'cache-control': 'public, s-maxage=300' } });
});
