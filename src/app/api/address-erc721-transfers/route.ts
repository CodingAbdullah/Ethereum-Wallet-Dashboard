import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// NFT transfers for a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    const data = await moralis('/' + address + '/nft/transfers?chain=' + moralisChain(network) + '&format=decimal&direction=both', 120);
    return NextResponse.json(data);
});
