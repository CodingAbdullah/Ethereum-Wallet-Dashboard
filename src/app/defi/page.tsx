import DefiOverviewSection from "../components/DefiOverviewSection";
import ServerSection from "../components/ServerSection";
import { getDefiOverview } from "@/lib/defi";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "DeFi Overview",
    description: "Total value locked by chain and protocol, DEX volume, fees, stablecoin supply and yields"
}

// DeFi Overview Page Custom Component
export default function DefiPage() {

    // Render the DeFi Overview Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    DeFi Overview
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Where the money is across decentralized finance
            </p>
            <ServerSection load={getDefiOverview} loading="Loading DeFi data…" failed="Could not load DeFi data. Please try again later.">
                {data => <DefiOverviewSection data={data} />}
            </ServerSection>
        </div>
    )
}
