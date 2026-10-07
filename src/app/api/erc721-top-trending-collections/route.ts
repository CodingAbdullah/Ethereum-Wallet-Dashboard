import { NextResponse } from "next/server";
import { opensea, getCollectionStats } from "@/lib/providers/opensea";
import { withErrorHandling } from "@/lib/api/route";

const COLLECTION_COUNT = 15;

interface OpenSeaCollection {
    collection: string;
    name: string;
    image_url: string;
}

// Top Ethereum NFT collections by 7-day volume (OpenSea free API).
// Replaces Moralis' top-collections market data endpoint, which Moralis has shut down.
export const GET = withErrorHandling(async () => {
    const { collections } = await opensea<{ collections: OpenSeaCollection[] }>(
        '/collections?chain=ethereum&order_by=seven_day_volume&limit=' + COLLECTION_COUNT,
        900
    );

    const withStats = await Promise.allSettled(collections.map(async collection => {
        const stats = await getCollectionStats(collection.collection);
        const oneDay = stats.intervals.find(interval => interval.interval === 'one_day');
        const sevenDay = stats.intervals.find(interval => interval.interval === 'seven_day');

        return {
            slug: collection.collection,
            collection_title: collection.name,
            collection_image: collection.image_url,
            floor_price: stats.total.floor_price,
            floor_price_symbol: stats.total.floor_price_symbol || 'ETH',
            volume_24h: oneDay?.volume ?? 0,
            volume_24h_percent_change: (oneDay?.volume_change ?? 0) * 100,
            volume_7d: sevenDay?.volume ?? 0,
            owners: stats.total.num_owners
        };
    }));

    // Skip collections whose stats request failed rather than failing the whole table
    const topCollections = withStats.flatMap(result => (result.status === 'fulfilled' ? [result.value] : []));

    return NextResponse.json({ topCollections });
});
