import { NextResponse } from "next/server";
import { moralis, moralisChain } from "@/lib/providers/moralis";
import { hasMarketValue } from "@/lib/chains";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// Wallet net worth on one network, excluding spam tokens (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);

    // Testnet tokens have no market value
    if (!hasMarketValue(network)) return NextResponse.json({ information: { result: [] } });

    const data = await moralis('/wallets/' + address + '/net-worth?chains%5B0%5D=' + moralisChain(network) + '&exclude_spam=true&exclude_unverified_contracts=true', 300);
    return NextResponse.json(data);
});
