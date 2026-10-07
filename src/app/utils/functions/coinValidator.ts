import CoinChartInfoType from "../types/CoinChartInfoType";
import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { coinIdSchema } from "@/lib/validation";

// Returns CoinGecko data for a coin ID, or null if the ID is invalid or unknown
export const coinValidator = async (coin: string): Promise<CoinChartInfoType | null> => {
    if (!coinIdSchema.safeParse(coin).success) return null;

    try {
        return await coingecko<CoinChartInfoType>('/coins/' + coin + '?localization=false&tickers=false&community_data=false&developer_data=false', CG_CACHE.lookup);
    }
    catch {
        return null;
    }
}
