"use client";

import ERC721CollectionAttributeSummaryInfoTable from "@/app/components/ERC721CollectionAttributeSummaryInfoTable";
import ERC721CollectionDataInfoTable from "@/app/components/ERC721CollectionDataInfoTable";
import ERC721CollectionExtraDataInfoTable from "@/app/components/ERC721CollectionExtraDataInfoTable";
import ERC721CollectionFloorPriceInfoTable from "@/app/components/ERC721CollectionFloorPriceInfoTable";
import ERC721CollectionSalesInfoTable from "@/app/components/ERC721CollectionSalesInfoTable";
import ERC721CollectionTransfersInfoTable from "@/app/components/ERC721CollectionTransfersInfoTable";
import { collectionValidator } from "@/app/utils/functions/collectionValidator";
import type { Metadata } from "next"
import { useRouter } from "next/router";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum Trending Collection Analytics",
    description: "Lookup and analyze a trending Ethereum ERC721 collection"
}

// Displaying historical price information of a particular coin
export default async function TrendingCollectionsPage() {
    const router = useRouter();
    const collection = String(router.query.collection);

    // Check validity of this coin by running a custom function validating if it exists within the Coin Gecko coin list
    const validateCollection = await collectionValidator(collection);

    if (validateCollection !== '') {
        // Render the Generic Chart Page componen if the coin ID is valid
        return (
            <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
                <h4 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        Trending Collection Data
                    </span>
                </h4>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    <i>{collection.toUpperCase()} - {validateCollection}</i>
                </p>
                <ERC721CollectionDataInfoTable address={validateCollection} />
                <ERC721CollectionFloorPriceInfoTable address={validateCollection} />
                <ERC721CollectionExtraDataInfoTable address={validateCollection} />
                <ERC721CollectionAttributeSummaryInfoTable address={validateCollection} />
                <ERC721CollectionTransfersInfoTable address={validateCollection} />
                <ERC721CollectionSalesInfoTable address={validateCollection} />
            </div>
        )
    }   
    else {
        // Collection ID is not valid, therefore return the error page
        throw new Error();
    }
}