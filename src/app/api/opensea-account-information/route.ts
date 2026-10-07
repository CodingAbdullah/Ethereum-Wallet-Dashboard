import { NextResponse } from "next/server";
import { opensea } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// OpenSea profile for a wallet (OpenSea free API)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    return NextResponse.json(await opensea('/accounts/' + address, 3600));
});
