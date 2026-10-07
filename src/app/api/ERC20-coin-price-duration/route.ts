import { NextResponse } from "next/server";
import { z } from "zod";
import dayjs from "dayjs";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressSchema, intervalSchema, marketChartQuery } from "@/lib/validation";

const bodySchema = z.object({ contract: addressSchema, interval: intervalSchema });

// ERC20 token price history by contract address (CoinGecko Demo API)
export const POST = withErrorHandling(async (request: Request) => {
    const { contract, interval } = await parseBody(request, bodySchema);
    const information = await coingecko<{ prices: [number, number][] }>(
        '/coins/ethereum/contract/' + contract.toLowerCase() + '/market_chart?' + marketChartQuery(interval),
        CG_CACHE.chart
    );

    const prices = interval === '24' ? information.prices.slice(-25) : information.prices;

    return NextResponse.json({
        coinPrices: prices.map(([time, price]) => ({
            date: dayjs(time).format(interval === '24' ? 'HH:mm' : 'YYYY-MM-DD'),
            price: Number(price)
        }))
    });
});
