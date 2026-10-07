import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// NFTs held by a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    const data = await moralis('/' + address + '/nft?chain=' + moralisChain(network) + '&format=decimal', 300);
    return NextResponse.json(data);
});
