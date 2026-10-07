import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenLookupBody } from "@/lib/validation";

// Transfer history of a single NFT (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id, network } = await parseBody(request, tokenLookupBody);
    const data = await moralis('/nft/' + address + '/' + id + '/transfers?chain=' + moralisChain(network) + '&format=decimal', 300);
    return NextResponse.json({ information: data });
});
