import { NextResponse } from "next/server";
import { moralis } from "@/lib/providers/moralis";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { contractBody } from "@/lib/validation";

// Recent transfers of an ERC20 token (Moralis free plan)
export const POST = withErrorHandling(async (request: Request) => {
    const { contract } = await parseBody(request, contractBody);
    const data = await moralis('/erc20/' + contract + '/transfers', 120);
    return NextResponse.json(data);
});
