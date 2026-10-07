import { NextResponse } from "next/server";
import { getCollectionSlug, getCollectionTraits } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Trait counts for an NFT collection (OpenSea free API).
// Replaces Alchemy's summarizeNFTAttributes, which Alchemy removed on Sept 30, 2026.
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const traits = await getCollectionTraits(await getCollectionSlug(address));
    return NextResponse.json({ information: { summary: traits.counts ?? {} } });
});
