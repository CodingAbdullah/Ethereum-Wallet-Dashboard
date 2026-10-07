import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { CHAIN_PAGES, getChainDetail } from "@/lib/l2";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// One chain's overview for /l2/[chain]: TVL and history, top protocols, live block and gas, L2BEAT stage
export const GET = withErrorHandling(async (_request: Request, { params }: { params: Promise<{ chain: string }> }) => {
    const { chain: key } = await params;
    const chain = CHAIN_PAGES.find(c => c.key === key);
    if (!chain) throw new HttpError(404, 'Unknown chain');
    return NextResponse.json(await getChainDetail(chain), { headers: { 'cache-control': 'public, s-maxage=30, stale-while-revalidate=300' } });
});
