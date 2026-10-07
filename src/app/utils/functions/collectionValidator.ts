import { coingecko, CG_CACHE } from "@/lib/providers/coingecko";
import { coinIdSchema } from "@/lib/validation";

// Returns the contract address for a CoinGecko NFT collection ID, or an empty string if it is unknown
export const collectionValidator = async (collection: string): Promise<string> => {
    if (!coinIdSchema.safeParse(collection).success) return '';

    try {
        const data = await coingecko<{ contract_address?: string }>('/nfts/' + collection, CG_CACHE.lookup);
        return data.contract_address ?? '';
    }
    catch {
        return '';
    }
}
