import { NextResponse } from "next/server";
import { opensea, openseaChain, getCollectionSlug, getCollectionTraits } from "@/lib/providers/opensea";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { tokenLookupBody } from "@/lib/validation";

interface OpenSeaNft {
    nft: {
        traits: { trait_type: string; value: string | number }[] | null;
    };
}

// How common each of a token's traits is within its collection (OpenSea free API).
// Replaces Alchemy's computeRarity, which Alchemy removed on Sept 30, 2026.
export const POST = withErrorHandling(async (request: Request) => {
    const { address, id, network } = await parseBody(request, tokenLookupBody);

    // OpenSea doesn't index testnets or every L2
    const chain = openseaChain(network);
    if (!chain) return NextResponse.json({ information: { data: [] } });

    const slug = await getCollectionSlug(address, network);
    const [{ nft }, traits, collection] = await Promise.all([
        opensea<OpenSeaNft>('/chain/' + chain + '/contract/' + address + '/nfts/' + id, 3600),
        getCollectionTraits(slug),
        opensea<{ total_supply: number }>('/collections/' + slug, 3600)
    ]);

    const supply = collection.total_supply || 0;

    const data = (nft.traits ?? []).map(trait => {
        const count = traits.counts?.[trait.trait_type]?.[String(trait.value)] ?? 0;
        return {
            value: String(trait.value),
            trait_type: trait.trait_type,
            prevalence: supply > 0 ? count / supply : 0
        };
    });

    return NextResponse.json({ information: { data } });
});
