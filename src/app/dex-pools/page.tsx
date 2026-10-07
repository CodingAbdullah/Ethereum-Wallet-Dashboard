import DexPoolsSection from "../components/DexPoolsSection";
import { GECKO_NETWORKS } from "@/lib/dexPools";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "DEX Pools",
    description: "Trending and newly created DEX pools on Ethereum and L2s, with token security checks"
}

// DEX Pools Page Custom Component
export default async function DexPoolsPage({ searchParams }: { searchParams: Promise<{ chain?: string }> }) {
    const requested = (await searchParams).chain;
    const chain = requested && requested in GECKO_NETWORKS ? requested : 'eth';

    // Render the DEX Pools Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    DEX Pools
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 text-center">
                Trending and brand-new trading pairs
            </p>
            <DexPoolsSection chain={chain} />
        </div>
    )
}
