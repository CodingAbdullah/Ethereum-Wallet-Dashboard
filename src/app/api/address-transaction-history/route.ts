import { NextResponse } from "next/server";
import { etherscan } from "@/lib/providers/etherscan";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Normal transactions for a wallet, newest first (Etherscan V2 free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const data = await etherscan<unknown[]>({
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 1000,
        sort: 'desc'
    }, 'eth', 60);

    return NextResponse.json(data);
});
