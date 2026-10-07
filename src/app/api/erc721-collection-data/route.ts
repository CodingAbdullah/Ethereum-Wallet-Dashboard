import { NextResponse } from "next/server";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// NFT collection metadata (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const data = await moralis('/nft/' + address, 3600);
    return NextResponse.json({ information: data });
});
