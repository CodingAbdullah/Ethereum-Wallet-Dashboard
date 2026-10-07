import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenLookupBody } from "@/lib/validation";

// Metadata for a single NFT (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id, network } = await parseBody(request, tokenLookupBody);
    const data = await moralis('/nft/' + address + '/' + id + '?chain=' + moralisChain(network) + '&format=decimal', 3600);
    return NextResponse.json({ information: data });
});
