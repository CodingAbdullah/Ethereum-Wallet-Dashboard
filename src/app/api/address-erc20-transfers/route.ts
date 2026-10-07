import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// ERC20 transfers for a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    const data = await moralis('/' + address + '/erc20/transfers?chain=' + moralisChain(network), 120);
    return NextResponse.json(data);
});
