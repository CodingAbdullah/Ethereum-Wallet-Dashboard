import { NextResponse } from "next/server";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressNetworkBody } from "@/lib/validation";

// Wallet net worth on Ethereum mainnet, excluding spam tokens (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address, network } = await parseBody(request, addressNetworkBody);

    // Testnet tokens have no market value
    if (network !== 'eth') return NextResponse.json({ information: { result: [] } });

    const data = await moralis('/wallets/' + address + '/net-worth?chains%5B0%5D=eth&exclude_spam=true&exclude_unverified_contracts=true', 300);
    return NextResponse.json(data);
});
