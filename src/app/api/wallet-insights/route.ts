import { NextResponse } from "next/server";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";
import { getWalletInsights } from "@/lib/walletInsights";

// Token approvals, DeFi positions and a readable activity feed for any wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    return NextResponse.json(await getWalletInsights([{ address, chain: network }]));
});
