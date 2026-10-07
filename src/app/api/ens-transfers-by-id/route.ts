import { NextResponse } from "next/server";
import { z } from "zod";
import { moralis } from "@/lib/providers/moralis";
import { ENS_BASE_REGISTRAR } from "@/lib/ens";
import { toTransferRows } from "@/lib/nftTransfers";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenIdSchema } from "@/lib/validation";

const bodySchema = z.object({ id: tokenIdSchema });

// Transfer history of a .eth name by its registrar token ID (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { id } = await parseBody(request, bodySchema);
    const data = await moralis<{ result?: [] }>('/nft/' + ENS_BASE_REGISTRAR + '/' + id + '/transfers?chain=eth&format=decimal');
    return NextResponse.json({ results: toTransferRows(data.result) });
});
