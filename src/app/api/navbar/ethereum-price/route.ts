import { NextResponse } from "next/server";
import { getEthPrice } from "@/lib/providers/ethPrice";
import { withErrorHandling } from "@/lib/api/route";

// ETH price and 24h change for the metrics navbar
export const GET = withErrorHandling(async () => {
    return NextResponse.json({ ethereum: await getEthPrice() });
});
