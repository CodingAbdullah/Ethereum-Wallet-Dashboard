import { NextResponse } from "next/server";
import { getCollectionSlug, getCollectionStats } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

const PERIOD_LABELS = { one_day: '24 Hours', seven_day: '7 Days', thirty_day: '30 Days' } as const;

// Volume, sales and average price for an NFT collection over 1, 7 and 30 days (OpenSea free API).
// Replaces CoinGecko's NFT market_chart history, which is paid-only.
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);
    const slug = await getCollectionSlug(address);
    const stats = await getCollectionStats(slug);

    return NextResponse.json({
        slug,
        total: stats.total,
        periods: stats.intervals.map(interval => ({
            period: PERIOD_LABELS[interval.interval] ?? interval.interval,
            volume: interval.volume,
            sales: interval.sales,
            average_price: interval.average_price,
            volume_change_percent: interval.volume_change * 100
        }))
    });
});
