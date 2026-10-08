import { NextResponse } from "next/server";
import type { Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { addressNetworkBody } from "@/lib/validation";
import { hasMarketValue } from "@/lib/chains";
import { getApprovals } from "@/lib/walletInsights";
import { chainClient } from "@/lib/providers/rpc";
import { withLiveAllowances } from "@/lib/onchain/approvals";

export const dynamic = 'force-dynamic';

// POST: a wallet's ERC20 approvals (Moralis), checked against live on-chain allowances
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);
    if (!hasMarketValue(network)) throw new HttpError(400, 'Approvals are only listed on mainnets');
    const approvals = await getApprovals(address, network);
    return NextResponse.json(await withLiveAllowances(chainClient(network), address as Address, approvals));
});
