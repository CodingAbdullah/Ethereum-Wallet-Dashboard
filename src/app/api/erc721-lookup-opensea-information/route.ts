import { NextResponse } from "next/server";
import { opensea, openseaChain } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenLookupBody } from "@/lib/validation";

// OpenSea data for a single NFT (OpenSea free API)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id, network } = await parseBody(request, tokenLookupBody);

    // OpenSea doesn't index testnets or every L2
    const chain = openseaChain(network);
    if (!chain) return NextResponse.json({ information: [] });

    const information = await opensea('/chain/' + chain + '/contract/' + address + '/nfts/' + id, 3600);
    return NextResponse.json({ information });
});
