import { NextResponse } from "next/server";
import { opensea, openseaChain } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenLookupBody } from "@/lib/validation";

// OpenSea data for a single NFT (OpenSea free API)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id, network } = await parseBody(request, tokenLookupBody);

    // OpenSea's mainnet API does not index testnets
    if (network !== 'eth') return NextResponse.json({ information: [] });

    const information = await opensea('/chain/' + openseaChain(network) + '/contract/' + address + '/nfts/' + id, 3600);
    return NextResponse.json({ information });
});
