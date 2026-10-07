import { NextResponse } from "next/server";
import dayjs from "dayjs";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling } from "@/lib/api/route";

// Ethereum market cap over the last 30 days.
// CoinGecko's global market cap chart is paid-only, so the homepage charts ETH's own market cap (free) instead.
export const GET = withErrorHandling(async () => {
    const data = await coingecko<{ market_caps: [number, number][] }>('/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily', CG_CACHE.longChart);

    return NextResponse.json({
        capValues: data.market_caps.map(([time, cap]) => ({
            date: dayjs(time).format('YYYY-MM-DD'),
            price: Number(cap)
        }))
    });
});
