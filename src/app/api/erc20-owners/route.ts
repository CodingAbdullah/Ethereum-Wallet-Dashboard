import { NextResponse } from "next/server";
import { ethplorer } from "@/lib/providers/ethplorer";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { contractBody } from "@/lib/validation";

interface EthplorerHolders {
    holders: { address: string; balance: number; share: number }[];
}

interface EthplorerTokenInfo {
    decimals: string;
    price?: { rate?: number } | false;
}

// Top holders of an ERC20 token (Ethplorer free API).
// Replaces Moralis' token owners endpoint, which is a premium (paid) endpoint.
export const POST = withErrorHandling(async (request: Request) => {
    const { contract } = await parseBody(request, contractBody);

    const [{ holders }, token] = await Promise.all([
        ethplorer<EthplorerHolders>('/getTopTokenHolders/' + contract + '?limit=100'),
        ethplorer<EthplorerTokenInfo>('/getTokenInfo/' + contract)
    ]);

    const decimals = Number(token.decimals) || 0;
    const price = token.price && token.price.rate ? token.price.rate : 0;

    const result = (holders ?? []).map(holder => {
        const balance = holder.balance / 10 ** decimals;
        return {
            owner_address: holder.address,
            balance: balance.toLocaleString('en-US', { maximumFractionDigits: 4 }),
            usd_value: String(balance * price),
            percentage_relative_to_total_supply: holder.share
        };
    });

    return NextResponse.json({ result });
});
