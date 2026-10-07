import { NextResponse } from "next/server";
import { z } from "zod";
import { moralis } from "@/lib/providers/moralis";
import { ENS_BASE_REGISTRAR, ensTokenId } from "@/lib/ens";
import { toTransferRows } from "@/lib/nftTransfers";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { ensNameSchema } from "@/lib/validation";

const bodySchema = z.object({ address: ensNameSchema });

// Transfer history of a .eth name (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { address: name } = await parseBody(request, bodySchema);
    const data = await moralis<{ result?: [] }>('/nft/' + ENS_BASE_REGISTRAR + '/' + ensTokenId(name) + '/transfers?chain=eth&format=decimal');
    return NextResponse.json({ results: toTransferRows(data.result) });
});
