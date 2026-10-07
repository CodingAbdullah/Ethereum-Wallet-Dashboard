import { NextResponse } from "next/server";
import { isHash } from "viem";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { explorerChain } from "@/lib/explorer";
import { rpcClientFor } from "@/lib/providers/rpc";
import { chainInfo } from "@/lib/chains";

// GET ?hash=0x..&chain=eth: whether a transaction is pending, mined or failed (used to update /tx live)
export const GET = withErrorHandling(async (request: Request) => {
    const params = new URL(request.url).searchParams;
    const hash = params.get('hash') ?? '';
    if (!isHash(hash)) throw new HttpError(400, 'Invalid transaction hash');
    const client = rpcClientFor(chainInfo(explorerChain(params.get('chain') ?? undefined)).chainId);
    const receipt = await client.getTransactionReceipt({ hash }).catch(() => null);
    return NextResponse.json(
        receipt ? { status: receipt.status === 'success' ? 'success' : 'failed', blockNumber: Number(receipt.blockNumber) } : { status: 'pending', blockNumber: null },
        { headers: { 'cache-control': 'no-store' } }
    );
});
