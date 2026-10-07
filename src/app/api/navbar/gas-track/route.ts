import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { getGasEstimate } from "@/lib/gas";

export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getGasEstimate());
});
