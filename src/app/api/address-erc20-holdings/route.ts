import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// ERC20 token balances for a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    const data = await moralis('/' + address + '/erc20?chain=' + moralisChain(network), 120);
    return NextResponse.json(data);
});
