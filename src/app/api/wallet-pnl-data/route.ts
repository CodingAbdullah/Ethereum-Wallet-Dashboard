import { NextResponse } from "next/server";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Realized profit and loss summary for a wallet (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const data = await moralis('/wallets/' + address + '/profitability/summary', 600);
    return NextResponse.json(data);
});
