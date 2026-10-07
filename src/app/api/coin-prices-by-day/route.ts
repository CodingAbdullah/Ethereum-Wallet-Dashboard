import { NextResponse } from "next/server";
import { z } from "zod";
import dayjs from "dayjs";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { coinIdSchema, intervalSchema, marketChartQuery } from "@/lib/validation";

const bodySchema = z.object({ coin: coinIdSchema, interval: intervalSchema });

// Coin price history (CoinGecko Demo API)
export const POST = withErrorHandling(async (request: Request) => {
    const { coin, interval } = await parseBody(request, bodySchema);
    const information = await coingecko<{ prices: [number, number][] }>('/coins/' + coin + '/market_chart?' + marketChartQuery(interval), CG_CACHE.chart);

    const prices = interval === '24' ? information.prices.slice(-25) : information.prices;

    return NextResponse.json({
        coinPrices: prices.map(([time, price]) => ({
            date: dayjs(time).format(interval === '24' ? 'HH:mm' : 'YYYY-MM-DD'),
            price: Number(price)
        }))
    });
});
