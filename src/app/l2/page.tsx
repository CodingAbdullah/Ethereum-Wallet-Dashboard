import L2OverviewSection from "../components/L2OverviewSection";
import ServerSection from "../components/ServerSection";
import { getL2Overview } from "@/lib/l2";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Layer 2 Networks",
    description: "Compare Ethereum layer 2 networks: value locked, rollup type and L2BEAT risk stage"
}

// Layer 2 Overview Page Custom Component
export default function L2Page() {

    // Render the Layer 2 Overview Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Layer 2 Networks
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                How Ethereum&apos;s rollups compare
            </p>
            <ServerSection load={getL2Overview} loading="Loading layer 2 data…" failed="Could not load layer 2 data. Please try again later.">
                {data => <L2OverviewSection data={data} />}
            </ServerSection>
        </div>
    )
}
