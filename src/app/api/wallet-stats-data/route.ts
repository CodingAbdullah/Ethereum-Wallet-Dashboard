import { NextResponse } from "next/server";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Activity counts for a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const data = await moralis('/wallets/' + address + '/stats', 600);
    return NextResponse.json(data);
});
