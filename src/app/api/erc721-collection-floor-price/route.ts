import { NextResponse } from "next/server";
import { getCollectionSlug, getCollectionStats } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// Current floor price of an NFT collection (OpenSea free API).
// Returned in the { [marketplace]: { floorPrice, priceCurrency, collectionUrl, retrievedAt } } shape the table expects.
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const slug = await getCollectionSlug(address);
    const stats = await getCollectionStats(slug);

    return NextResponse.json({
        information: {
            openSea: {
                floorPrice: stats.total.floor_price,
                priceCurrency: stats.total.floor_price_symbol || 'ETH',
                collectionUrl: 'https://opensea.io/collection/' + slug,
                retrievedAt: new Date().toISOString()
            }
        }
    });
});
